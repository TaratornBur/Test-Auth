import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
//import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-store';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', false); // Suppress the warning

@Module({
  imports: [
    AuthModule,
    UsersModule,
    // MongooseModule.forRoot('mongodb://localhost/test-auth'),
    // CacheModule.register({
    //   store: redisStore,

    //   // Store-specific configuration:
    //   host: 'localhost',
    //   port: 6379,
    // }),
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
