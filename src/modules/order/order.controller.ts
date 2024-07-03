import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  CreateOrderDto,
  GetOrdersDto,
  UpdateOrderDto,
} from './dto';
import { OrderService } from './order.service';
import { CustomException, ErrorCode } from '@/common/exceptions/custom.exception';
import { JwtGuard, PreviewGuard, RoleGuard } from '@/common/guards';
import { Roles, SUPER_ADMIN } from '@/common/decorators/roles.decorator';

@Controller('order')
@UseGuards(JwtGuard, RoleGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @UseGuards(PreviewGuard)
  @Roles(SUPER_ADMIN)
  create(@Body() createRoleDto: CreateOrderDto) {
    return this.orderService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: GetOrdersDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @Roles(SUPER_ADMIN)
  findOne(@Param('id') number: string) {
    return this.orderService.findOrderByNumber(number);
  }

  @Patch(':id')
  @UseGuards(PreviewGuard)
  @Roles(SUPER_ADMIN, 'SYS_ADMIN', 'ROLE_PMS')
  update(@Param('id') number: string, @Body() updateRoleDto: UpdateOrderDto) {
    return this.orderService.update(number, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(PreviewGuard)
  @Roles(SUPER_ADMIN)
  remove(@Param('id') number: string) {
    return this.orderService.remove(number);
  }
}
