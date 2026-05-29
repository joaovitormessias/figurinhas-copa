import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminStockStatus,
  Prisma,
  PurchaseOrderStatus,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

type PrismaTransaction = Prisma.TransactionClient;

const orderInclude = {
  items: {
    include: {
      sticker: true,
      adminStock: true,
    },
  },
  reservations: {
    include: {
      sticker: true,
      adminStock: true,
    },
  },
} satisfies Prisma.PurchaseOrderInclude;

type OrderWithDetails = Prisma.PurchaseOrderGetPayload<{
  include: typeof orderInclude;
}>;

type AdminStockWithSticker = Prisma.AdminStockGetPayload<{
  include: { sticker: true };
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderWithReservation(data: CreateOrderDto) {
    const groupedItems = this.groupItems(data.items);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const stockItems: Array<{
        requestedQuantity: number;
        stockItem: AdminStockWithSticker;
      }> = [];

      for (const item of groupedItems) {
        await this.lockAdminStock(tx, item.adminStockId);

        const stockItem = await tx.adminStock.findUnique({
          where: { id: item.adminStockId },
          include: { sticker: true },
        });

        if (!stockItem || !stockItem.sticker.isActive) {
          throw new NotFoundException('Inventory item not found.');
        }

        if (
          !stockItem.isVisible ||
          stockItem.status === AdminStockStatus.unavailable
        ) {
          throw new BadRequestException(
            'Inventory item is not available for purchase.',
          );
        }

        const availableQuantity =
          stockItem.quantity - stockItem.reservedQuantity;

        if (availableQuantity < item.quantity) {
          throw new BadRequestException('Insufficient available stock.');
        }

        stockItems.push({ requestedQuantity: item.quantity, stockItem });
      }

      const totalAmount = stockItems.reduce(
        (total, item) =>
          total.plus(item.stockItem.salePrice.mul(item.requestedQuantity)),
        new Prisma.Decimal(0),
      );

      const order = await tx.purchaseOrder.create({
        data: {
          userId: data.userId,
          status: PurchaseOrderStatus.pending_admin_approval,
          totalAmount,
          expiresAt,
          userNote: data.userNote,
        },
      });

      for (const item of stockItems) {
        const subtotal = item.stockItem.salePrice.mul(item.requestedQuantity);

        await tx.purchaseOrderItem.create({
          data: {
            orderId: order.id,
            stickerId: item.stockItem.stickerId,
            adminStockId: item.stockItem.id,
            quantity: item.requestedQuantity,
            unitPrice: item.stockItem.salePrice,
            subtotal,
          },
        });

        await this.incrementReservedQuantity(
          tx,
          item.stockItem.id,
          item.requestedQuantity,
        );

        await tx.reservation.create({
          data: {
            orderId: order.id,
            adminStockId: item.stockItem.id,
            stickerId: item.stockItem.stickerId,
            quantity: item.requestedQuantity,
            status: ReservationStatus.active,
            expiresAt,
          },
        });
      }

      return this.findOrderOrThrow(tx, order.id);
    });
  }

  listMyOrders(userId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listAdminOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  getAdminOrder(id: string) {
    return this.findOrderOrThrow(this.prisma, id);
  }

  async approveOrder(id: string, adminNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);

      if (order.status !== PurchaseOrderStatus.pending_admin_approval) {
        throw new BadRequestException('Only pending orders can be approved.');
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.approved,
          adminDecisionAt: new Date(),
          adminNote,
        },
        include: orderInclude,
      });
    });
  }

  async rejectOrder(id: string, adminNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);
      this.ensureOrderCanReleaseReservation(order);

      await this.releaseReservation(tx, order, ReservationStatus.released);

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.rejected,
          adminDecisionAt: new Date(),
          adminNote,
        },
        include: orderInclude,
      });
    });
  }

  async completeOrder(id: string, adminNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);

      if (order.status !== PurchaseOrderStatus.approved) {
        throw new BadRequestException('Only approved orders can be completed.');
      }

      await this.convertReservationToSale(tx, order);

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.completed,
          completedAt: new Date(),
          adminNote,
        },
        include: orderInclude,
      });
    });
  }

  async cancelOrderByUser(
    id: string,
    userId: string,
    cancellationReason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);

      if (order.userId !== userId) {
        throw new ForbiddenException('Order does not belong to this user.');
      }

      this.ensureOrderCanReleaseReservation(order);

      await this.releaseReservation(tx, order, ReservationStatus.released);

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.cancelled_by_user,
          cancelledAt: new Date(),
          cancellationReason,
        },
        include: orderInclude,
      });
    });
  }

  async cancelOrderByAdmin(
    id: string,
    cancellationReason?: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);
      this.ensureOrderCanReleaseReservation(order);

      await this.releaseReservation(tx, order, ReservationStatus.released);

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.cancelled_by_admin,
          cancelledAt: new Date(),
          cancellationReason,
          adminNote,
        },
        include: orderInclude,
      });
    });
  }

  async expireOrder(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.findOrderOrThrow(tx, id);
      this.ensureOrderCanReleaseReservation(order);

      await this.releaseReservation(tx, order, ReservationStatus.expired);

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.expired,
          cancelledAt: new Date(),
          cancellationReason: 'Reservation expired.',
        },
        include: orderInclude,
      });
    });
  }

  async releaseReservation(
    tx: PrismaTransaction,
    order: OrderWithDetails,
    releasedStatus: ReservationStatus,
  ) {
    const releasedAt = new Date();

    for (const reservation of order.reservations) {
      if (reservation.status !== ReservationStatus.active) {
        continue;
      }

      await this.lockAdminStock(tx, reservation.adminStockId);

      const stockItem = await tx.adminStock.findUnique({
        where: { id: reservation.adminStockId },
      });

      if (!stockItem || stockItem.reservedQuantity < reservation.quantity) {
        throw new BadRequestException(
          'Reserved quantity cannot become negative.',
        );
      }

      await tx.adminStock.update({
        where: { id: reservation.adminStockId },
        data: {
          reservedQuantity: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: releasedStatus,
          releasedAt,
        },
      });
    }
  }

  async convertReservationToSale(
    tx: PrismaTransaction,
    order: OrderWithDetails,
  ) {
    const convertedAt = new Date();

    for (const reservation of order.reservations) {
      if (reservation.status !== ReservationStatus.active) {
        throw new BadRequestException(
          'Order does not have an active reservation.',
        );
      }

      await this.lockAdminStock(tx, reservation.adminStockId);

      const stockItem = await tx.adminStock.findUnique({
        where: { id: reservation.adminStockId },
      });

      if (
        !stockItem ||
        stockItem.quantity < reservation.quantity ||
        stockItem.reservedQuantity < reservation.quantity
      ) {
        throw new BadRequestException('Stock quantity is inconsistent.');
      }

      await tx.adminStock.update({
        where: { id: reservation.adminStockId },
        data: {
          quantity: {
            decrement: reservation.quantity,
          },
          reservedQuantity: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.converted_to_sale,
          convertedAt,
        },
      });
    }
  }

  private async findOrderOrThrow(
    client: PrismaTransaction | PrismaService,
    id: string,
  ) {
    const order = await client.purchaseOrder.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  private groupItems(items: CreateOrderDto['items']) {
    const groupedItems = new Map<string, number>();

    for (const item of items) {
      groupedItems.set(
        item.adminStockId,
        (groupedItems.get(item.adminStockId) ?? 0) + item.quantity,
      );
    }

    return [...groupedItems.entries()].map(([adminStockId, quantity]) => ({
      adminStockId,
      quantity,
    }));
  }

  private async incrementReservedQuantity(
    tx: PrismaTransaction,
    adminStockId: string,
    quantity: number,
  ) {
    const stockItem = await tx.adminStock.findUnique({
      where: { id: adminStockId },
    });

    if (!stockItem) {
      throw new NotFoundException('Inventory item not found.');
    }

    const nextReservedQuantity = stockItem.reservedQuantity + quantity;

    if (nextReservedQuantity > stockItem.quantity) {
      throw new BadRequestException(
        'Reserved quantity cannot be greater than quantity.',
      );
    }

    await tx.adminStock.update({
      where: { id: adminStockId },
      data: {
        reservedQuantity: {
          increment: quantity,
        },
      },
    });
  }

  private ensureOrderCanReleaseReservation(order: OrderWithDetails) {
    if (order.status === PurchaseOrderStatus.completed) {
      throw new BadRequestException('Completed orders cannot be cancelled.');
    }

    if (
      order.status === PurchaseOrderStatus.rejected ||
      order.status === PurchaseOrderStatus.cancelled_by_user ||
      order.status === PurchaseOrderStatus.cancelled_by_admin ||
      order.status === PurchaseOrderStatus.expired
    ) {
      throw new BadRequestException('Order reservation was already released.');
    }
  }

  private lockAdminStock(tx: PrismaTransaction, adminStockId: string) {
    return tx.$queryRaw`
      SELECT id
      FROM figurinhas.admin_stock
      WHERE id = ${adminStockId}
      FOR UPDATE
    `;
  }
}
