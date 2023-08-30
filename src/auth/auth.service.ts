import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/interfaces/users.interface';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmUserDto } from './dto/confirmUser.dto';

@Injectable()
export class AuthService {
  private cache: cacheManager.Cache;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.cache = cacheManager.caching({
      store: redisStore,
      host: 'localhost', // Redis host
      port: 6379, // Redis port
      // ... add any other Redis configuration options if needed
    });
  }
  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass && user?.status !== 'activate') {
      throw new UnauthorizedException();
    }
    //const { password, ...result } = user;
    const payload = { sub: user._id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { username } = createUserDto;
    // Find exists user by Email
    const existsUser = await this.usersService.findOneByUsernme(username);
    if (existsUser) {
      throw new ConflictException(
        'อีเมลผู้ใช้นี้มีผู้อื่นใช้งานแล้ว ลองใช้ชื่ออื่น',
      );
    }
    try {
      // Create User
      const createdUser: User = await this.usersService.create(createUserDto);
      // Generate Token
      const token = uuidv4();
      console.log('tokenGenByMySelf: ', token);

      // caching here to save token to nestjs caching
      const testCache = await this.cache.set(token, createdUser, {
        ttl: 240,
      }); // Set TTL in seconds
      console.log('testCache: ', testCache);

      return createdUser;
    } catch (error) {
      throw new BadRequestException('เกิดข้อผิดพลาด');
    }
  }

  async confirmTokenFromCache(
    confirmUserDto: ConfirmUserDto,
  ): Promise<User | undefined> {
    try {
      const cachedData = await this.cache.get<User>(confirmUserDto.token);
      console.log(cachedData);
      const updateStatusUser = await this.usersService.updateStatus(
        confirmUserDto.user_id,
        confirmUserDto.status,
      );

      console.log('updateStatusUser: ', updateStatusUser);

      return cachedData; // Returns the cached data if found, or undefined if not found
    } catch (error) {
      // Handle any cache retrieval errors here
      console.error('Error retrieving cached data:', error);
      return undefined;
    }
  }
}
