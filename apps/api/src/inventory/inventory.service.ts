import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminStock, AdminStockStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminStockDto } from './dto/create-admin-stock.dto';
import { UpdateAdminStockDto } from './dto/update-admin-stock.dto';

type AdminStockWithSticker = Prisma.AdminStockGetPayload<{
  include: { sticker: true };
}>;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    const stockItems = await this.prisma.adminStock.findMany({
      where: {
        isVisible: true,
        status: { not: AdminStockStatus.unavailable },
        sticker: { isActive: true },
      },
      include: { sticker: true },
      orderBy: [
        { sticker: { albumNumber: 'asc' } },
        { sticker: { code: 'asc' } },
      ],
    });

    return stockItems
      .filter((stockItem) => this.getAvailableQuantity(stockItem) > 0)
      .map((stockItem) => this.toPublicResponse(stockItem));
  }

  async getPublicById(id: string) {
    const stockItem = await this.prisma.adminStock.findFirst({
      where: {
        id,
        isVisible: true,
        status: { not: AdminStockStatus.unavailable },
        sticker: { isActive: true },
      },
      include: { sticker: true },
    });

    if (!stockItem || this.getAvailableQuantity(stockItem) <= 0) {
      throw new NotFoundException('Inventory item not found.');
    }

    return this.toPublicResponse(stockItem);
  }

  async create(data: CreateAdminStockDto) {
    await this.ensureStickerExists(data.stickerId);
    this.ensureValidQuantities(
      data.quantity,
      data.reservedQuantity ?? 0,
    );

    return this.prisma.adminStock.create({
      data: {
        stickerId: data.stickerId,
        quantity: data.quantity,
        reservedQuantity: data.reservedQuantity ?? 0,
        salePrice: data.salePrice,
        isVisible: data.isVisible ?? true,
        status: data.status ?? AdminStockStatus.available,
      },
      include: { sticker: true },
    });
  }

  async update(id: string, data: UpdateAdminStockDto) {
    const current = await this.findStockOrThrow(id);

    if (data.stickerId) {
      await this.ensureStickerExists(data.stickerId);
    }

    const nextQuantity = data.quantity ?? current.quantity;
    const nextReservedQuantity =
      data.reservedQuantity ?? current.reservedQuantity;

    this.ensureValidQuantities(nextQuantity, nextReservedQuantity);

    return this.prisma.adminStock.update({
      where: { id },
      data,
      include: { sticker: true },
    });
  }

  async updateVisibility(id: string, isVisible: boolean) {
    await this.findStockOrThrow(id);

    return this.prisma.adminStock.update({
      where: { id },
      data: { isVisible },
      include: { sticker: true },
    });
  }

  private async findStockOrThrow(id: string) {
    const stockItem = await this.prisma.adminStock.findUnique({
      where: { id },
    });

    if (!stockItem) {
      throw new NotFoundException('Inventory item not found.');
    }

    return stockItem;
  }

  private async ensureStickerExists(stickerId: string) {
    const sticker = await this.prisma.stickerCatalog.findUnique({
      where: { id: stickerId },
      select: { id: true },
    });

    if (!sticker) {
      throw new NotFoundException('Sticker not found.');
    }
  }

  private ensureValidQuantities(quantity: number, reservedQuantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative.');
    }

    if (reservedQuantity < 0) {
      throw new BadRequestException('Reserved quantity cannot be negative.');
    }

    if (reservedQuantity > quantity) {
      throw new BadRequestException(
        'Reserved quantity cannot be greater than quantity.',
      );
    }
  }

  private getAvailableQuantity(stockItem: AdminStock) {
    return stockItem.quantity - stockItem.reservedQuantity;
  }

  private toPublicResponse(stockItem: AdminStockWithSticker) {
    return {
      id: stockItem.id,
      stickerId: stockItem.stickerId,
      sticker: {
        id: stockItem.sticker.id,
        code: stockItem.sticker.code,
        albumNumber: stockItem.sticker.albumNumber,
        playerName: stockItem.sticker.playerName,
        teamName: stockItem.sticker.teamName,
        category: stockItem.sticker.category,
        collection: stockItem.sticker.collection,
        imageUrl: stockItem.sticker.imageUrl,
        isActive: stockItem.sticker.isActive,
      },
      salePrice: stockItem.salePrice,
      quantity: stockItem.quantity,
      reservedQuantity: stockItem.reservedQuantity,
      availableQuantity: this.getAvailableQuantity(stockItem),
      status: stockItem.status,
      isVisible: stockItem.isVisible,
    };
  }
}
