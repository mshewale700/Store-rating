import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Retrieve administrative count statistics and breakdown charts (Admin Only)' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('store-owner')
  @Roles(Role.STORE_OWNER)
  @ApiOperation({ summary: 'Retrieve owned store rating stats and user ratings feed (Store Owner Only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  getStoreOwnerStats(
    @GetUser('id') ownerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.dashboardService.getStoreOwnerStats(ownerId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }
}
