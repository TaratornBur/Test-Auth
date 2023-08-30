/* eslint-disable prettier/prettier */
import { Document } from 'mongoose';

export type ProductDoc = Product & Document;
export interface Product {
  readonly _id: string;
  readonly product_id: string;
  readonly name: string;
  readonly weight: number;
  readonly dimension: dimension;
  readonly image: string[];
  readonly sku_id: string;
  readonly deleteAt: Date;
}

export interface dimension {
  readonly lenght: number;
  readonly width: number;
  readonly height: number;
}
