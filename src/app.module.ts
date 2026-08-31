import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { NotifiedMatch } from './database/entities/notified-match.entity';
import { Surname } from './database/entities/surname.entity';
import { User } from './database/entities/user.entity';
import { HealthController } from './health/health.controller';
import { I18nModule } from './i18n/i18n.module';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('POSTGRES_HOST', 'postgres'),
        port: Number(config.get('POSTGRES_PORT', 5432)),
        username: config.get<string>('POSTGRES_USER', 'bot'),
        password: config.get<string>('POSTGRES_PASSWORD', 'bot'),
        database: config.get<string>('POSTGRES_DB', 'rescued_people'),
        entities: [User, Surname, NotifiedMatch],
        synchronize: config.get('DB_SYNCHRONIZE', 'true') !== 'false',
        retryAttempts: 20,
        retryDelay: 3000,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not set');
        }
        return { token };
      },
    }),
    I18nModule,
    MonitorModule,
    BotModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
