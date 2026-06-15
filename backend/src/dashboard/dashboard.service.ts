import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [totalUsers, totalStores, totalRatings, roleCounts, ratingCounts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),
      this.prisma.rating.groupBy({
        by: ['rating'],
        _count: {
          rating: true,
        },
      }),
    ]);

    const rolesBreakdown = roleCounts.map((group) => ({
      role: group.role,
      count: group._count.role,
    }));

    const ratingBreakdown = Array.from({ length: 5 }, (_, i) => {
      const star = i + 1;
      const found = ratingCounts.find((g) => g.rating === star);
      return {
        rating: star,
        count: found ? found._count.rating : 0,
      };
    });

    return {
      totalUsers,
      totalStores,
      totalRatings,
      charts: {
        rolesBreakdown,
        ratingBreakdown,
      },
    };
  }

  async getStoreOwnerStats(
    ownerId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('You do not own any store registered on the platform.');
    }

    const ratings = store.ratings;
    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(2)) : 0;

    const ratingCounts = await this.prisma.rating.groupBy({
      by: ['rating'],
      where: { storeId: store.id },
      _count: {
        rating: true,
      },
    });

    const ratingBreakdown = Array.from({ length: 5 }, (_, i) => {
      const star = i + 1;
      const found = ratingCounts.find((g) => g.rating === star);
      return {
        rating: star,
        count: found ? found._count.rating : 0,
      };
    });

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      storeId: store.id,
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

    const [ratingsCount, ratingsList] = await Promise.all([
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

    const usersList = ratingsList.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        name: r.user.name,
        email: r.user.email,
      },
    }));

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
        ratingBreakdown,
      },
      ratings: {
        data: usersList,
        meta: {
          total: ratingsCount,
          page,
          limit,
          totalPages: Math.ceil(ratingsCount / limit),
        },
      },
    };
  }
}
