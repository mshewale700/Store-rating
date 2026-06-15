import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const jwtMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestException if email already exists', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@test.com' } as any);
      
      await expect(
        service.register({ name: 'Test User', email: 'test@test.com', password: 'password', address: '123 Test St' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_password');
      prismaService.user.create.mockResolvedValueOnce({ id: '1', email: 'test@test.com' } as any);

      const result = await service.register({ name: 'Test User', email: 'test@test.com', password: 'password', address: '123 Test St' });
      
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@test.com',
          address: '123 Test St',
          password: 'hashed_password',
          role: Role.USER,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.login({ email: 'test@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({ id: '1', password: 'hashed_password' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong_password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user on successful login', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashed_password', role: Role.USER, name: 'Test', address: '123' };
      prismaService.user.findUnique.mockResolvedValueOnce(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      jwtService.signAsync.mockResolvedValueOnce('access_token').mockResolvedValueOnce('refresh_token');

      const result = await service.login({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: { id: '1', email: 'test@test.com', role: Role.USER, name: 'Test', address: '123' },
      });
    });
  });
});
