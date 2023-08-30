import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { HttpResponse } from 'src/shared/interfaces/http-response.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createProduct(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<HttpResponse> {
    const createdOrder = await this.orderService.create(createOrderDto);
    console.log('user: ', req.user);
    await this.usersService.addedOrderHistory(
      req.user.sub,
      createOrderDto.order_id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'การสร้างข้อมูลคำสั่งซื้อสำเร็จ',
      data: createdOrder,
    };
  }

  @UseGuards(AuthGuard)
  @Post('/cancelOrder/:id')
  async findOneByKeyword(@Param('id') id: string): Promise<HttpResponse> {
    const cancelOreder: any = await this.orderService.updateStatusToCancel(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'การยกเลิกรายการสั่งซื้อเสร็จสิ้น',
      data: cancelOreder,
    };
  }

  @UseGuards(AuthGuard)
  @Get()
  async getOrders(): Promise<HttpResponse> {
    const orders = await this.orderService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'การเรียกดูข้อมูลรายการสั่งซื้อเสำเร็จ',
      data: orders,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<HttpResponse> {
    const order = await this.orderService.findOneById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'การเรียกดูข้อมูลรายการสั่งซื้อสำเร็จ',
      data: order,
    };
  }
}
