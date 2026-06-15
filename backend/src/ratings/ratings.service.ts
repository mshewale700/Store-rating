import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRatingDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existing = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: dto.storeId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('You have already rated this store. Please update your existing rating.');
    }

    return this.prisma.rating.create({
      data: {
        userId,
        storeId: dto.storeId,
        rating: dto.rating,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateRatingDto) {
    const ratingRecord = await this.prisma.rating.findUnique({
      where: { id },
    });
    if (!ratingRecord) {
      throw new NotFoundException('Rating not found');
    }

    if (ratingRecord.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this rating');
    }

    return this.prisma.rating.update({
      where: { id },
      data: { rating: dto.rating },
    });
  }

  async delete(id: string, userId: string) {
    const ratingRecord = await this.prisma.rating.findUnique({
      where: { id },
    });
    if (!ratingRecord) {
      throw new NotFoundException('Rating not found');
    }

    if (ratingRecord.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this rating');
    }

    await this.prisma.rating.delete({ where: { id } });
    return { message: 'Rating removed successfully' };
  }

  async getRatingsForStore(
    storeId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      storeId,
    };

    if (params.search) {
      where.user = {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [total, ratings] = await Promise.all([
      this.prisma.rating.count({ where }),
      this.prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const data = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        name: r.user.name,
        email: r.user.email,
      },
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
