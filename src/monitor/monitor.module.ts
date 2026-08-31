import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifiedMatch } from '../database/entities/notified-match.entity';
import { NdrrmaModule } from '../ndrrma/ndrrma.module';
import { UsersModule } from '../users/users.module';
import { MonitorService } from './monitor.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotifiedMatch]), NdrrmaModule, UsersModule],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
