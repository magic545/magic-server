/**********************************
 * @Author: Magic Forge
 * @LastEditor: Magic Forge
 * @LastEditTime: 2024-06-06 17:50:24
 * @Email: magicforge@163.com
 ***********************************/

import { Exclude } from 'class-transformer';
import { Allow, IsString, IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: '订单名称不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '订单描述不能为空' })
  description: string;

  @IsOptional()
  userId: number;
}

export class GetOrdersDto {
  @Allow()
  pageSize?: number;

  @Allow()
  pageNo?: number;

  @Allow()
  number?: string;

  @Allow()
  userId?: number;

  @Allow()
  step?: number;
  
  @Allow()
  state?: number;
}

export class UpdateOrderDto extends CreateOrderDto {
  
}