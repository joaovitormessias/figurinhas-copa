import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserOfferStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

const offerInclude = {
  sticker: true,
} satisfies Prisma.UserOfferInclude;

type OfferWithSticker = Prisma.UserOfferGetPayload<{
  include: typeof offerInclude;
}>;

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createOffer(data: CreateOfferDto) {
    await this.ensureStickerExists(data.stickerId);

    const created = await this.prisma.userOffer.create({
      data: {
        userId: data.userId,
        stickerId: data.stickerId,
        quantity: data.quantity,
        condition: data.condition,
        suggestedPrice:
          data.suggestedPrice === undefined
            ? undefined
            : new Prisma.Decimal(data.suggestedPrice),
        systemPrice: new Prisma.Decimal(1.5),
        status: UserOfferStatus.pending,
        userNote: data.userNote,
      },
      include: offerInclude,
    });

    await this.auditService.logAction({
      actorUserId: data.userId,
      action: 'user_offer.created',
      entity: 'UserOffer',
      entityId: created.id,
      newValue: this.toAuditOfferValue(created),
    });

    return created;
  }

  listMyOffers(userId: string) {
    return this.prisma.userOffer.findMany({
      where: { userId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listAdminOffers() {
    return this.prisma.userOffer.findMany({
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  getAdminOffer(id: string) {
    return this.findOfferOrThrow(id);
  }

  async markUnderReview(id: string, adminNote?: string, actorUserId?: string) {
    const offer = await this.findOfferOrThrow(id);

    if (offer.status !== UserOfferStatus.pending) {
      throw new BadRequestException('Only pending offers can move to review.');
    }

    const updated = await this.updateOfferStatus(
      id,
      UserOfferStatus.under_review,
      {
        adminNote,
        reviewedAt: new Date(),
      },
    );

    await this.auditService.logAction({
      actorUserId,
      action: 'user_offer.under_review',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  async acceptOffer(
    id: string,
    adminFinalPrice?: number,
    adminNote?: string,
    actorUserId?: string,
  ) {
    const offer = await this.findOfferOrThrow(id);

    if (
      offer.status !== UserOfferStatus.pending &&
      offer.status !== UserOfferStatus.under_review
    ) {
      throw new BadRequestException('Only open offers can be accepted.');
    }

    const updated = await this.updateOfferStatus(id, UserOfferStatus.accepted, {
      adminFinalPrice: this.toOptionalDecimal(adminFinalPrice),
      adminNote,
      reviewedAt: new Date(),
    });

    await this.auditService.logAction({
      actorUserId,
      action: 'user_offer.accepted',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  async rejectOffer(id: string, adminNote?: string, actorUserId?: string) {
    const offer = await this.findOfferOrThrow(id);

    if (
      offer.status !== UserOfferStatus.pending &&
      offer.status !== UserOfferStatus.under_review
    ) {
      throw new BadRequestException('Only open offers can be rejected.');
    }

    const updated = await this.updateOfferStatus(id, UserOfferStatus.rejected, {
      adminNote,
      reviewedAt: new Date(),
    });

    await this.auditService.logAction({
      actorUserId,
      action: 'user_offer.rejected',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  async cancelOfferByAdmin(
    id: string,
    cancellationReason?: string,
    adminNote?: string,
    actorUserId?: string,
  ) {
    const offer = await this.findOfferOrThrow(id);
    this.ensureOfferCanBeCancelled(offer);

    const updated = await this.updateOfferStatus(
      id,
      UserOfferStatus.cancelled_by_admin,
      {
        adminNote,
        cancellationReason,
        cancelledAt: new Date(),
      },
    );

    await this.auditService.logAction({
      actorUserId,
      action: 'user_offer.cancelled_by_admin',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  async completeOffer(
    id: string,
    adminFinalPrice?: number,
    adminNote?: string,
    actorUserId?: string,
  ) {
    const offer = await this.findOfferOrThrow(id);

    if (offer.status !== UserOfferStatus.accepted) {
      throw new BadRequestException('Only accepted offers can be completed.');
    }

    const updated = await this.updateOfferStatus(
      id,
      UserOfferStatus.completed,
      {
        adminFinalPrice: this.toOptionalDecimal(adminFinalPrice),
        adminNote,
        completedAt: new Date(),
      },
    );

    await this.auditService.logAction({
      actorUserId,
      action: 'user_offer.completed',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  async cancelOfferByUser(
    id: string,
    userId: string,
    cancellationReason?: string,
  ) {
    const offer = await this.findOfferOrThrow(id);

    if (offer.userId !== userId) {
      throw new ForbiddenException('Offer does not belong to this user.');
    }

    this.ensureOfferCanBeCancelled(offer);

    const updated = await this.updateOfferStatus(
      id,
      UserOfferStatus.cancelled_by_user,
      {
        cancellationReason,
        cancelledAt: new Date(),
      },
    );

    await this.auditService.logAction({
      actorUserId: userId,
      action: 'user_offer.cancelled_by_user',
      entity: 'UserOffer',
      entityId: updated.id,
      oldValue: this.toAuditOfferValue(offer),
      newValue: this.toAuditOfferValue(updated),
    });

    return updated;
  }

  private toAuditOfferValue(offer: OfferWithSticker) {
    return {
      userId: offer.userId,
      stickerId: offer.stickerId,
      quantity: offer.quantity,
      condition: offer.condition,
      suggestedPrice: offer.suggestedPrice?.toString() ?? null,
      systemPrice: offer.systemPrice.toString(),
      adminFinalPrice: offer.adminFinalPrice?.toString() ?? null,
      status: offer.status,
      reviewedAt: offer.reviewedAt?.toISOString() ?? null,
      completedAt: offer.completedAt?.toISOString() ?? null,
      cancelledAt: offer.cancelledAt?.toISOString() ?? null,
    };
  }

  private async findOfferOrThrow(id: string) {
    const offer = await this.prisma.userOffer.findUnique({
      where: { id },
      include: offerInclude,
    });

    if (!offer) {
      throw new NotFoundException('Offer not found.');
    }

    return offer;
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

  private ensureOfferCanBeCancelled(offer: OfferWithSticker) {
    if (offer.status === UserOfferStatus.completed) {
      throw new BadRequestException('Completed offers cannot be cancelled.');
    }

    if (
      offer.status === UserOfferStatus.rejected ||
      offer.status === UserOfferStatus.cancelled_by_user ||
      offer.status === UserOfferStatus.cancelled_by_admin
    ) {
      throw new BadRequestException('Offer is already closed.');
    }
  }

  private updateOfferStatus(
    id: string,
    status: UserOfferStatus,
    data: Prisma.UserOfferUpdateInput,
  ) {
    return this.prisma.userOffer.update({
      where: { id },
      data: {
        ...data,
        status,
      },
      include: offerInclude,
    });
  }

  private toOptionalDecimal(value?: number) {
    return value === undefined ? undefined : new Prisma.Decimal(value);
  }
}
