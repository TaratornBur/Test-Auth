/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';
export interface Order {
  readonly _id: string;
  readonly order_id: string;
  readonly product_list: product[];
  readonly status?: string;
  readonly deleteAt: Date;
}

export interface product {
  readonly product_object_id: Types.ObjectId;
  readonly sku_id: string;
  readonly quantity: number;
}
