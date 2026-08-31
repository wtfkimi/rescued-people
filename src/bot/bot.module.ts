import { Module } from '@nestjs/common';
import { MonitorModule } from '../monitor/monitor.module';
import { UsersModule } from '../users/users.module';
import { BotUpdate } from './bot.update';

@Module({
  imports: [UsersModule, MonitorModule],
  providers: [BotUpdate],
})
export class BotModule {}
