import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ratings')
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Submit a new store rating (Normal User Only)' })
  @ApiResponse({ status: 201, description: 'Rating submitted successfully' })
  @ApiResponse({ status: 400, description: 'User already rated this store' })
  create(@GetUser('id') userId: string, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(userId, dto);
  }

  @Put(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Update an existing rating (Normal User Only)' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(id, userId, dto);
  }

  @Delete(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Remove an existing rating (Normal User Only)' })
  @ApiResponse({ status: 200, description: 'Rating removed successfully' })
  delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ratingsService.delete(id, userId);
  }

  @Get('store/:id')
  @Roles(Role.ADMIN, Role.STORE_OWNER)
  @ApiOperation({ summary: 'Get ratings for a specific store (Admin or Store Owner)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getRatingsForStore(
    @Param('id') storeId: string,
    @GetUser() currentUser: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    if (currentUser.role === Role.STORE_OWNER) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
      });
      if (!store || store.ownerId !== currentUser.id) {
        throw new ForbiddenException('You are not authorized to view ratings for this store');
      }
    }

    return this.ratingsService.getRatingsForStore(storeId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }
}
