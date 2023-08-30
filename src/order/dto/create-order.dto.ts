import mongoose from 'mongoose';

export class CreateOrderDto {
  order_id: string;
  product_list: [
    {
      product_object_id: mongoose.Types.ObjectId;
      sku_id: string;
      quantity: number;
    },
  ];
  status?: string;
  deleteAt: Date;
}
