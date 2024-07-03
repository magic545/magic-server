import { Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/modules/user/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  number: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: 1 })
  step: number;

  @Column({ nullable: true })
  state: number;

  @Column({ nullable: true })
  price: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToOne(() => User, (user) => user.orders, {
    createForeignKeyConstraints: false,
  })
  user: User;
}
