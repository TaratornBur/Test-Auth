/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: true,
    },
    product_list: {
      type: Array,
      product_object_id: {
        type: mongoose.Types.ObjectId,
        ref: 'products',
        default: undefined,
      },
      sku_id: {
        type: Number,
        required: false,
      },
      quantity: {
        type: Number,
        required: false,
      },
    },
    status: {
      type: String,
    },
    deleteAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);
