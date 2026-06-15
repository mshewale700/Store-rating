import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      store: {
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      rating: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdminStats', () => {
    it('should return admin statistics successfully', async () => {
      prismaService.user.count.mockResolvedValueOnce(10);
      prismaService.store.count.mockResolvedValueOnce(5);
      prismaService.rating.count.mockResolvedValueOnce(20);
      prismaService.user.groupBy.mockResolvedValueOnce([
        { role: 'USER', _count: { role: 8 } },
        { role: 'ADMIN', _count: { role: 2 } },
      ] as any);
      prismaService.rating.groupBy.mockResolvedValueOnce([
        { rating: 4, _count: { rating: 15 } },
        { rating: 5, _count: { rating: 5 } },
      ] as any);

      const result = await service.getAdminStats();

      expect(result).toEqual({
        totalUsers: 10,
        totalStores: 5,
        totalRatings: 20,
        charts: {
          rolesBreakdown: [
            { role: 'USER', count: 8 },
            { role: 'ADMIN', count: 2 },
          ],
          ratingBreakdown: [
            { rating: 1, count: 0 },
            { rating: 2, count: 0 },
            { rating: 3, count: 0 },
            { rating: 4, count: 15 },
            { rating: 5, count: 5 },
          ],
        },
      });
    });
  });
});
