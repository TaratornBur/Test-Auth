import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model, Types } from 'mongoose';
import { User } from './interfaces/users.interface';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_MODELL') private userModel: Model<User>) {}
  // create(createUserDto: CreateUserDto) {
  //   const secretKey = process.env.SECRET_KEY;
  //   return 'This action adds a new user';
  // }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdBrand = new this.userModel(createUserDto);
      return await createdBrand.save();
    } catch (error) {
      Logger.error(`[UserService.create] save data is failed!`);
      Logger.error(error);
      throw new BadRequestException('เกิดข้อผิดพลาดในการบันทึกข้อมูลยูสเซอร์');
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneByUsernme(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username: username });
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async updateStatus(id: string, status: string) {
    if (status !== 'activate' && status !== 'not_activate') {
      throw new BadRequestException('Invalid status value');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { status }, // Update only the status field
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('ไม่พบข้อมูลของยูสเซอร์นี้');
    }

    return updatedUser;
  }

  async updateAuthToUser(id: string, access_token: string, refresh_token: string) {

    const updatedUserAuthToUse = await this.userModel.findByIdAndUpdate(
      id,
      { access_token, refresh_token}, // Update only the status field
      { new: true },
    );

    console.log('updatedUserAuthToUse: ', updatedUserAuthToUse);


    if (!updatedUserAuthToUse) {
      throw new NotFoundException('ไม่พบข้อมูลของยูสเซอร์นี้');
    }

    return updatedUserAuthToUse;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async addedOrderHistory(user_id: string, order_id: string): Promise<any> {
    const updatedOfferPrice = await this.updateOrderHistory(user_id, order_id);
    if (!updatedOfferPrice) {
      throw new BadRequestException(
        'ไม่สามารถเพิ่มผู้เสนอราคา กรุณาตรวจสอบข้อมูล',
      );
    }

    return updatedOfferPrice;
  }

  async updateOrderHistory(user_id: string, order_id: string): Promise<User> {
    try {
      // Update student;
      const updatedOfferPrice = await this.userModel.findByIdAndUpdate(
        // warehouse_id,
        { _id: user_id },
        { $addToSet: { order_history_by_orderId: order_id } },
      );

      return updatedOfferPrice;
    } catch (error) {
      Logger.error('{updatedOfferPrice} Error', error);
      throw new BadRequestException(
        'พบข้อผิดพลาดในการเพิ่มผู้เสนอราคา กรุณาลองใหม่อีกครั้ง',
      );
    }
  }

  async findOrderHistory(user_id: string): Promise<any> {
    const user = await this.userModel.findById(user_id);
    const orderHistory = user.order_history_by_orderId;

    return orderHistory;
  }

  async getUserProfile(user_id: string): Promise<any> {
    const aggregation =
      // [
      //   {
      //     $match: {
      //       deleteAt: {
      //         $ne: true,
      //         $eq: null,
      //       },
      //     },
      //   },
      // ];
      [
        {
          $match: {
            _id: new Types.ObjectId(user_id),
          },
        },
        {
          $project: {
            name: 1,
            phone: 1,
            order_history_by_orderId: 1,
          },
        },
      ];
    const userProfile = await this.userModel.aggregate(aggregation);
    if (userProfile && !userProfile.length) {
      throw new NotFoundException('ยังไม่มีข้อมูลสินค้าอยู่เลย');
    }
    return userProfile;
  }
}
