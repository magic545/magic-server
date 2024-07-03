/**********************************
 * @Author: Magic Forge
 * @LastEditor: Magic Forge
 * @LastEditTime: 2024-06-06 17:07:10
 * @Email: magicforge@163.com
 ***********************************/
import { Global, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/user.entity';
import { Profile } from '@/modules/user/profile.entity';
import { Order } from '@/modules/order/order.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Profile])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
