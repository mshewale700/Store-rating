import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new store (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  @ApiResponse({ status: 400, description: 'Store Owner already owns a store or is invalid' })
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @GetUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.storesService.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      userId: user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store details by ID' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.storesService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update store details (Admin or Store Owner)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @GetUser() user: any,
  ) {
    if (user.role !== Role.ADMIN) {
      const store = await this.storesService.findOne(id);
      if (store.ownerId !== user.id) {
        throw new ForbiddenException('You are not authorized to update this store');
      }
    }
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a store (Admin Only)' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
