import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PgListenService } from './pg-listen.service';

@Global()
@Module({
  providers: [PrismaService, PgListenService],
  exports: [PrismaService, PgListenService],
})
export class PrismaModule {}
