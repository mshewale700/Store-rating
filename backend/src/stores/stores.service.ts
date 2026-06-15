import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Role } from '../role.enum';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: dto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Store owner user not found');
    }
    if (owner.role !== Role.STORE_OWNER) {
      throw new BadRequestException('Selected user is not a store owner');
    }

    const existingStore = await this.prisma.store.findUnique({
      where: { ownerId: dto.ownerId },
    });
    if (existingStore) {
      throw new BadRequestException('This store owner already manages another store');
    }

    return this.prisma.store.create({
      data: dto,
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { address: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [total, stores] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          ratings: {
            select: {
              id: true,
              userId: true,
              rating: true,
            },
          },
        },
      }),
    ]);

    const data = stores.map((store) => {
      const ratings = store.ratings;
      const totalRatings = ratings.length;
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(2)) : 0;

      let userSubmittedRating = null;
      let userSubmittedRatingId = null;
      if (params.userId) {
        const userRating = ratings.find((r) => r.userId === params.userId);
        if (userRating) {
          userSubmittedRating = userRating.rating;
          userSubmittedRatingId = userRating.id;
        }
      }

      const { ratings: _, ...storeWithoutRatings } = store;

      return {
        ...storeWithoutRatings,
        averageRating,
        totalRatings,
        userSubmittedRating,
        userSubmittedRatingId,
      };
    });

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

  async findOne(id: string, userId?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const ratings = store.ratings;
    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(2)) : 0;

    let userSubmittedRating = null;
    let userSubmittedRatingId = null;
    if (userId) {
      const userRating = ratings.find((r) => r.userId === userId);
      if (userRating) {
        userSubmittedRating = userRating.rating;
        userSubmittedRatingId = userRating.id;
      }
    }

    const { ratings: _, ...storeWithoutRatings } = store;

    return {
      ...storeWithoutRatings,
      averageRating,
      totalRatings,
      userSubmittedRating,
      userSubmittedRatingId,
    };
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (dto.ownerId && dto.ownerId !== store.ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: dto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException('Store owner user not found');
      }
      if (owner.role !== Role.STORE_OWNER) {
        throw new BadRequestException('Selected user is not a store owner');
      }

      const existingStore = await this.prisma.store.findUnique({
        where: { ownerId: dto.ownerId },
      });
      if (existingStore) {
        throw new BadRequestException('This store owner already manages another store');
      }
    }

    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    await this.prisma.store.delete({ where: { id } });
    return { success: true, message: 'Store deleted successfully' };
  }
}
