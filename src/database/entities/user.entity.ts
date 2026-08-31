import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Language } from '../../i18n/language.enum';
import { Surname } from './surname.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'telegram_id', type: 'bigint' })
  telegramId!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  language!: Language | null;

  @Column({ name: 'notifications_enabled', type: 'boolean', default: true })
  notificationsEnabled!: boolean;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked!: boolean;

  @OneToMany(() => Surname, (surname) => surname.user)
  surnames!: Surname[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
