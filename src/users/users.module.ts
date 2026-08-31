import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Surname } from '../database/entities/surname.entity';
import { User } from '../database/entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Surname])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
