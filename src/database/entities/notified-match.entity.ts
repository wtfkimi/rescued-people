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

@Entity('notified_matches')
@Unique('uq_notified_matches_user_person', ['userId', 'personId'])
export class NotifiedMatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'person_id', type: 'int' })
  personId!: number;

  @Column({ name: 'matched_surname', type: 'varchar', length: 128 })
  matchedSurname!: string;

  @Column({ name: 'person_name', type: 'varchar', length: 255, default: '' })
  personName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
