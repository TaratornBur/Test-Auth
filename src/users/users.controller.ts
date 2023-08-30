import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { HttpResponse } from 'src/shared/interfaces/http-response.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/findOrderHistory')
  async findOrderHistory(@Request() req): Promise<HttpResponse> {
    const userOrderHistory = await this.usersService.findOrderHistory(
      req.user.sub,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การสร้างข้อมูลสินค้าสำเร็จ',
      data: userOrderHistory,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/getUserProfile')
  async getUserProfile(@Request() req): Promise<HttpResponse> {
    const getUserProfile = await this.usersService.getUserProfile(req.user.sub);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'การสร้างข้อมูลสินค้าสำเร็จ',
      data: getUserProfile,
    };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
