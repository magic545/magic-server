/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2024-06-07 22:02:57
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CustomException, ErrorCode } from '@/common/exceptions/custom.exception';
import { User } from '@/modules/user/user.entity';
import { Order } from './order.entity';
import {
  CreateOrderDto,
  GetOrdersDto,
  UpdateOrderDto,
} from './dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRep: Repository<Order>,
    @InjectRepository(User)
    private userRep: Repository<User>,
  ) { }

  async create(order: CreateOrderDto) {
    const newOrder = this.orderRep.create({
      ...order,
      number: `magic${Date.now()}`
    });
    if (order.userId !== undefined) {
      newOrder.user = await this.userRep.findOne({ where: { id: order.userId } });
    }
    return this.orderRep.save(newOrder);
  }

  async findAll(query: GetOrdersDto) {
    const pageSize = query.pageSize || 10;
    const pageNo = query.pageNo || 1;
    const [orders, total] = await this.orderRep.findAndCount({
      select: {
        user: {
          username: true,
          profile: {
            userId: true,
            gender: true,
            avatar: true,
            email: true,
            address: true,
            nickName: true
          }
        }
      },
      relations: {
        user: {
          profile: true
        },
      },
      where: {
        number: query.number ?? undefined,
        step: query.step ?? undefined,
        state: query.state ?? undefined,
        user: {
          id: query.userId || undefined,
        },
      },
      order: {
        createTime: 'ASC',
      },
      take: pageSize,
      skip: (pageNo - 1) * pageSize,
    });
    const pageData = orders.map((item) => {
      const newItem = {
        ...item,
        ...(item.user?.profile || {}),
      };
      delete newItem.user;
      return newItem;
    });
    return { pageData, total };
  }

  async remove(number: string) {
    return this.orderRep
      .createQueryBuilder('order')
      .delete()
      .where('order.number = :number', { number })
      .execute();;
  }

  async update(number: string, order: UpdateOrderDto) {
    const findOrder = await this.findOrderByNumber(number);
    const newOrder = this.orderRep.merge(findOrder, order);
    await this.orderRep.save(newOrder);
    return true;
  }

  async findOrderByNumber(number: string) {
    return this.orderRep.findOne({ where: { number } });
  }
}
