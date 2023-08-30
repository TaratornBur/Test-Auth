/* eslint-disable prettier/prettier */
import { Connection } from 'mongoose';
import { ProductSchema } from './schema/product.schema';

export const productProviders = [
  {
    provide: 'PRODUCT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Product', ProductSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
