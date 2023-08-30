/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
export const ProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    weight: {
      type: Number,
    },
    detail: {
      type: String,
    },
    dimension: {
      lenght: {
        type: Number,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
    },
    image: {
      type: [String],
    },
    sku_id: {
      type: String,
      unique: true,
    },
    deleteAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);
