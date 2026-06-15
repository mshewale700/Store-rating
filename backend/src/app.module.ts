import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, StoresModule, RatingsModule, DashboardModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
