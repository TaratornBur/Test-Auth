import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000; // Use port 5000 or the one specified in the .env file
  await app.listen(port);
}
bootstrap();
