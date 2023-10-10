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
import * as crypto from 'crypto-js';
import { SignOutDto } from './dto/sign-out.dto';
import { timeStamp } from 'console';

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
    //เอาpassจากDBมาถอดรหัส
    const supperPass = await this.decodePassInMongo(
      user.password,
      process.env.SECRET_KEY_FOR_PASSWORD,
    );
    console.log(supperPass);

    const date = new Date();
    const timestampMinutes = Math.floor(date.getTime() / 60000);

    console.log('date get: ',  Math.floor(date.getTime()/1000));
    
    console.log('date: ', date.getTime()/ 60000);
    
    console.log('timestampMinutes: ', timestampMinutes);

    const confirmPassword = await this.decodeData(
      pass,
    );
    // console.log('userPass: ', supperPass);
    console.log('confirmPassword: ', confirmPassword.password);
    console.log('confirmTimestamp: ', confirmPassword.timestampMinutes);

    const oneMinuteAgo = timestampMinutes - 1;
    console.log('oneMinuteAgo: ', oneMinuteAgo.toString());
    


    if (
      supperPass !== confirmPassword.password ||
      user?.status !== 'activate' ||
      (timestampMinutes !== parseInt(confirmPassword.timestampMinutes) && oneMinuteAgo !== parseInt(confirmPassword.timestampMinutes))
    )  {
      throw new UnauthorizedException();
    }
    //const { password, ...result } = user;
    const payload = { sub: user._id, username: user.username };

    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    await this.usersService.updateAuthToUser(user._id, access_token, refresh_token)

    return {
      usename: user.username,
      name: user.name,
      phone: user.phone,
      access_token: access_token,
      refresh_token: refresh_token,
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
  ): Promise<any | undefined> {
    try {
      const cachedData = await this.cache.get<User>(confirmUserDto.token);
      console.log('cachedData', cachedData);
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

  async encodeData(password: string): Promise<any> {
    const date = new Date();
    const timestampMinutes = Math.floor(date.getTime() / 60000).toString();
    console.log('timestampMinutes: ', timestampMinutes);
    console.log('key: ', process.env.SECRET_KEY_FOR_CONFIRM);


    const encodedData = crypto.AES.encrypt(
      password + timestampMinutes,
      process.env.SECRET_KEY_FOR_CONFIRM,
    ).toString();
    return encodedData;
  }

  async decodeData(encodedData: string): Promise<any> {
    try {
      // Decrypt the encoded data using the same secret key
      const decryptedBytes = crypto.AES.decrypt(encodedData, process.env.SECRET_KEY_FOR_CONFIRM);

      // Convert the decrypted bytes to a string
      const decryptedText = decryptedBytes.toString(crypto.enc.Utf8);

      // Extract the timestamp and password
      const timestampLength = 8; // Assuming timestamp is 8 characters long
      const timestampMinutes = decryptedText.substr(-timestampLength);
      const password = decryptedText.slice(0, -timestampLength);

      return { timestampMinutes, password };
    } catch (error) {
      // Handle decryption errors here
      console.error('Decryption error:', error);
      throw error;
    }
  }


  async decodePassInMongo(encodedData: string, key: string): Promise<string | null> {
    try {
      const decryptedBytes = crypto.AES.decrypt(encodedData, key);
      const decryptedData = decryptedBytes.toString(crypto.enc.Utf8);

      // Assuming that the timestamp length is consistent (e.g., 13 characters for milliseconds)
      const timestampLength = 13;

      // Extract the password by removing the timestamp
      const password = decryptedData.substring(
        0,
        decryptedData.length - timestampLength,
      );

      return password;
    } catch (error) {
      // Decryption failed
      console.error('Decryption error:', error);
      return null;
    }
  }

  async decodePassword(encodedData: string): Promise<string | null> {
    try {
      console.log(encodedData);

      const CryptoJS = require('crypto-js');
      const key = process.env.SECRET_KEY_FOR_PASSWORD;
      const bytes = CryptoJS.AES.decrypt(encodedData, key);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedData;
    } catch (error) {
      // Decryption failed
      console.error('Decryption error:', error);
      return null;
    }
  }

  //ทดลองเวลาพี่โจยิงมา
  async confirmLogin(password: string): Promise<User | undefined> {
    try {
      const encode = await this.encodeData(password);
      console.log('encode: ', encode);

      const deCode = await this.decodeData(encode);
      console.log('deCode: ', deCode);

      // const date = new Date();

      // const hours = String(date.getHours()).padStart(2, '0');
      // const minutes = String(date.getMinutes()).padStart(2, '0');

      // const timeString = `${hours}:${minutes}`;
      // console.log(timeString);

      // const timestampMinutes = Math.floor(date.getTime() / 60000);
      // console.log(timestampMinutes);
      return; // Returns the cached data if found, or undefined if not found
    } catch (error) {
      // Handle any cache retrieval errors here
      console.error('Error retrieving cached data:', error);
      return undefined;
    }
  }

  async refreshToken(username: string): Promise<any> {
    console.log('username: ', username);

    const user = await this.usersService.findOne(username);
    console.log('user: ', user);

    //const { password, ...result } = user;
    const payload = { sub: user._id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsernme(username);

    if (user.status !== 'activate') {
      throw new BadRequestException('รหัสนี้ไม่พร้อมใช้งาน');
    }

    if (
      user &&
      user.status == 'activate'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      // return result;
      return user;
    }
    return null;
  }

  // async logout(refreshStr): Promise<void> {
  //   const refreshToken = await this.retrieveRefreshToken(refreshStr);

  //   if (!refreshToken) {
  //     return;
  //   }
  //   // delete refreshtoken from db
  //   this.refreshTokens = this.refreshTokens.filter(
  //     (refreshToken) => refreshToken.id !== refreshToken.id,
  //   );
  // }

  // async logout(signOutDto: SignOutDto): Promise<any> {
  //   const { accessToken, refreshToken } = signOutDto;

  //   if (!accessToken || !refreshToken) {
  //     throw new BadRequestException(
  //       'ข้อมูลไม่สมบูรณ์ ไม่สามารถดำเนินการต่อได้',
  //     );
  //   }

  //   // Decode payload
  //   const payload = await this.jwtService.decode(accessToken);
  //   const userId = payload.sub;

  //   // Remove ClientId
  //   const removedClient = await this.userService.removeClient(userId);
  //   if (!removedClient) {
  //     throw new BadRequestException('เกิดข้อผิดพลาดในการออกจากระบบ');
  //   }

  //   // Remove refreshToken in Redis
  //   this.client.del(userId).catch(error => {
  //     Logger.error('[AuthService.logout] error' + error);
  //     throw new BadRequestException('เกิดข้อผิดพลาดในการออกจากระบบ');
  //   });

  //   return true;
  // }
}
