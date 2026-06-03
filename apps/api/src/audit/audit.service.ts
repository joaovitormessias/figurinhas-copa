import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditJson = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

type LogActionInput = {
  actorUserId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: AuditJson;
  newValue?: AuditJson;
  metadata?: AuditJson;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(input: LogActionInput) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorUserId: input.actorUserId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          oldValue: input.oldValue,
          newValue: input.newValue,
          metadata: input.metadata,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Audit log skipped for ${input.entity}.${input.action}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      return null;
    }
  }

  listRecent() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
