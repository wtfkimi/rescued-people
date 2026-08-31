import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('surnames')
@Unique('uq_surnames_user_value', ['userId', 'value'])
export class Surname {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.surnames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 128 })
  value!: string;

  @Column({ name: 'display_value', type: 'varchar', length: 128 })
  displayValue!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
