/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DatabaseProviders } from './database.provider';
import { userProviders } from 'src/users/users.provider';
import { productProviders } from 'src/product/product.provider';
import { orderProviders } from 'src/order/order.provider';

@Module({
  providers: [
    ...DatabaseProviders,
    ...userProviders,
    ...productProviders,
    ...orderProviders,
  ],
  exports: [
    ...DatabaseProviders,
    ...userProviders,
    ...productProviders,
    ...orderProviders,
  ],
})
export class DatabaseModule {}
