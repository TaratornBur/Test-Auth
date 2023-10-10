/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { HttpResponse } from 'src/shared/interfaces/http-response.interface';
import { ConfirmUserDto } from './dto/confirmUser.dto';
import { AuthGuard } from './auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

//only admin can edit
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto): Promise<HttpResponse> {
    const user = await this.authService.register(createUserDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การลงทะเบียนสำเร็จ',
      data: user,
    };
  }

  @Post('/confirm/:user_id')
  async confirmTokenFromCache(
    @Query('token') token: string,
    @Param('user_id') user_id: string,
  ): Promise<HttpResponse> {
    // Construct the ConfirmUserDto object
    const confirmUserDto: ConfirmUserDto = {
      token, // Assign the provided token
      user_id: user_id, // Assign the user_id if needed
      status: 'activate', // Assign the appropriate status
    };

    try {
      // Call the service method to confirm the token from cache
      const confirm = await this.authService.confirmTokenFromCache(
        confirmUserDto,
      );

      // Construct and return the response
      const response: HttpResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'confirm',
        data: confirm,
      };

      return response;
    } catch (error) {
      console.error('Error confirming token:', error);

      // Construct and return an error response if needed
      const errorResponse: HttpResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while confirming the token.',
        data: null,
      };

      return errorResponse;
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('/confirmLogin/:password')
  async confirmLogin(
    @Param('password') password: string,
  ): Promise<HttpResponse> {
    const user = await this.authService.confirmLogin(password);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การลงทะเบียนสำเร็จ',
      data: user,
    };
  }

  @UseGuards(RefreshJwtGuard)
  @Post('/refreshToken')
  async refreshToken(
    @Request() req,
  ): Promise<HttpResponse> {
    const user = await this.authService.refreshToken(req.user);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การลงทะเบียนสำเร็จ',
      data: user,
    };
  }

  @Post('/:decodePassword')
  async decodePassword(@Param('decodePassword') encodedData: string): Promise<HttpResponse> {
    const user = await this.authService.decodePassword(encodedData);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การลงทะเบียนสำเร็จ',
      data: user,
    };
  }
}
