import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';
dotenv.config();
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '60s' },
    }),
    RefreshJwtStrategy
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
