import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { ListStickersQueryDto } from './dto/list-stickers-query.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';

@Injectable()
export class StickersService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(filters: ListStickersQueryDto) {
    return this.prisma.stickerCatalog.findMany({
      where: {
        isActive: true,
        ...this.buildPublicFilters(filters),
      },
      orderBy: [{ albumNumber: 'asc' }, { code: 'asc' }],
    });
  }

  async getActiveById(id: string) {
    const sticker = await this.prisma.stickerCatalog.findFirst({
      where: { id, isActive: true },
    });

    if (!sticker) {
      throw new NotFoundException('Sticker not found.');
    }

    return sticker;
  }

  async create(data: CreateStickerDto) {
    try {
      return await this.prisma.stickerCatalog.create({ data });
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  async update(id: string, data: UpdateStickerDto) {
    await this.ensureStickerExists(id);

    try {
      return await this.prisma.stickerCatalog.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleKnownPrismaError(error);
      throw error;
    }
  }

  activate(id: string) {
    return this.updateActiveStatus(id, true);
  }

  deactivate(id: string) {
    return this.updateActiveStatus(id, false);
  }

  private buildPublicFilters(
    filters: ListStickersQueryDto,
  ): Prisma.StickerCatalogWhereInput {
    return {
      ...(filters.code && {
        code: { contains: filters.code, mode: 'insensitive' },
      }),
      ...(filters.albumNumber && { albumNumber: filters.albumNumber }),
      ...(filters.playerName && {
        playerName: { contains: filters.playerName, mode: 'insensitive' },
      }),
      ...(filters.teamName && {
        teamName: { contains: filters.teamName, mode: 'insensitive' },
      }),
      ...(filters.category && {
        category: { contains: filters.category, mode: 'insensitive' },
      }),
    };
  }

  private async updateActiveStatus(id: string, isActive: boolean) {
    await this.ensureStickerExists(id);

    return this.prisma.stickerCatalog.update({
      where: { id },
      data: { isActive },
    });
  }

  private async ensureStickerExists(id: string) {
    const sticker = await this.prisma.stickerCatalog.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!sticker) {
      throw new NotFoundException('Sticker not found.');
    }
  }

  private handleKnownPrismaError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Sticker code already exists.');
    }
  }
}
