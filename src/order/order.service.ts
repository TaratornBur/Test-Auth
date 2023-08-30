import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Model } from 'mongoose';
import { Order } from './interfaces/order.interface';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_MODEL') private ordertModel: Model<Order>) {}
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const createdProduct = await new this.ordertModel(createOrderDto);
      return await createdProduct.save();
    } catch (error) {
      Logger.error(`[VendorService.create] save data is failed!`);
      Logger.error(error);
      throw new BadRequestException(
        'เกิดข้อผิดพลาดในการบันทึกข้อมูลคำสั่งซื้อ',
      );
    }
  }

  async updateStatusToCancel(order_id: string): Promise<Order> {
    const removeOrder = await this.ordertModel.findById(order_id);
    if (!removeOrder) {
      throw new BadRequestException(
        'เกิดข้อผิดพลาด ข้อมูลคำสั่งซื้อจึงไม่สามารถลบได้',
      );
    }
    const uodateStatusToCancel = await this.ordertModel.findOneAndUpdate(
      { _id: { $eq: order_id } },
      {
        $set: { status: 'Cancel' },
      },
      { new: true },
    );

    return uodateStatusToCancel;
  }

  async findAll(): Promise<Order[]> {
    const aggregation = [
      {
        $match: {
          deleteAt: {
            $ne: true,
            $eq: null,
          },
        },
      },
    ];
    const product = await this.ordertModel.aggregate(aggregation);
    if (product && !product.length) {
      throw new NotFoundException('ยังไม่มีข้อมูลสินค้าอยู่เลย');
    }
    return product;
  }

  async findOneById(id: string): Promise<Order> {
    const product = await this.ordertModel.findById(id);

    if (!product) {
      throw new NotFoundException('ไม่พบข้อมูลสินค้านี้');
    }

    return product;
  }
}
