import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Model } from 'mongoose';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductService {
  constructor(@Inject('PRODUCT_MODEL') private productModel: Model<Product>) {}
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const createdProduct = await new this.productModel(createProductDto);
      return await createdProduct.save();
    } catch (error) {
      Logger.error(`[VendorService.create] save data is failed!`);
      Logger.error(error);
      throw new BadRequestException('เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า');
    }
  }

  async findAll(): Promise<Product[]> {
    const aggregation = [
      {
        $match: {
          deleteAt: {
            $ne: true,
            $eq: null,
          },
        },
      },
    ];
    const product = await this.productModel.aggregate(aggregation);
    if (product && !product.length) {
      throw new NotFoundException('ยังไม่มีข้อมูลสินค้าอยู่เลย');
    }
    return product;
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('ไม่พบข้อมูลสินค้านี้');
    }

    return product;
  }

  async update(
    id: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const updatedVendor: Product = await this.productModel.findByIdAndUpdate(
      id,
      createProductDto,
      { new: true },
    );

    if (!updatedVendor) {
      throw new NotFoundException(
        'เกิดข้อผิดพลาด เนื่องจากไม่พบข้อมูลสินค้านี้',
      );
    }

    return updatedVendor;
  }

  async deleteOne(id: string): Promise<Product> {
    return await this.productModel.findByIdAndDelete(id);
  }

  async softDelete(id: string): Promise<Product> {
    const removeOrder = await this.productModel.findById(id);
    if (!removeOrder) {
      throw new BadRequestException(
        'เกิดข้อผิดพลาด ข้อมูลสินค้าจึงไม่สามารถลบได้',
      );
    }
    const updatedSoftDelete = await this.productModel.findOneAndUpdate(
      { _id: { $eq: id } },
      {
        $set: { deleteAt: new Date() },
      },
      { new: true },
    );

    return updatedSoftDelete;
  }

  // async validate_pincode(pincode: string): Promise<boolean> {
  //   pincode = pincode.trim();
  //   console.log(pincode);

  //   // 1. input จะต้องมีความยาวมากกว่าหรือเท่ากับ 6 ตัวอักษร
  //   if (pincode.length < 6) {
  //     return false;
  //   }

  //   // 2. input จะต้องกันไม่ให้มีเลขซ้ำติดกันเกิน 2 ตัว
  //   if (/(\d)\1{2,}/.test(pincode)) {
  //     return false;
  //   }

  //   // 3. input จะต้องกันไม่ให้มีเลขเรียงกันเกิน 2 ตัว
  //   for (let i = 0; i < pincode.length - 2; i++) {
  //     if (
  //       pincode.charCodeAt(i) + 1 === pincode.charCodeAt(i + 1) &&
  //       pincode.charCodeAt(i + 1) + 1 === pincode.charCodeAt(i + 2)
  //     ) {
  //       return false;
  //     }
  //   }

  //   // 4.input จะต้องกันไม่ให้มีเลขชุดซ้ำ เกิน 2 ชุด
  //   if ((pincode.match(/(\d)\1+/g) || []).length > 2) {
  //     return false;
  //   }

  //   return true;
  // }

  // async validate_pincode(pincode: string): Promise<boolean> {
  //   pincode = pincode.trim();

  //   // 1. input จะต้องมีความยาวมากกว่าหรือเท่ากับ 6 ตัวอักษร
  //   if (pincode.length < 6) {
  //     return false;
  //   }

  //   // 2. input จะต้องกันไม่ให้มีเลขซ้ำติดกันเกิน 2 ตัว
  //   if (/(\d)\1{2,}/.test(pincode)) {
  //     return false;
  //   }

  //   // 3. input จะต้องกันไม่ให้มีเลขเรียงกันเกิน 2 ตัว
  //   for (let i = 0; i < pincode.length - 2; i++) {
  //     if (
  //       (parseInt(pincode[i]) + 1 === parseInt(pincode[i + 1]) &&
  //         parseInt(pincode[i + 1]) + 1 === parseInt(pincode[i + 2])) ||
  //       (parseInt(pincode[i]) - 1 === parseInt(pincode[i + 1]) &&
  //         parseInt(pincode[i + 1]) - 1 === parseInt(pincode[i + 2]))
  //     ) {
  //       return false;
  //     }
  //   }

  //   // 4.input จะต้องกันไม่ให้มีเลขชุดซ้ำ เกิน 2 ชุด
  //   const repeatedGroups = pincode.match(/(\d)\1+/g) || [];
  //   if (
  //     repeatedGroups.length > 2 ||
  //     repeatedGroups.some((group) => group.length > 2)
  //   ) {
  //     return false;
  //   }

  //   return true;
  // }

  async validate_pincode(pincode: string): Promise<boolean> {
    pincode = pincode.trim();

    if (pincode.length < 6) {
      return false; // Condition 1
    }

    if (/(\d)\1{2,}/.test(pincode)) {
      return false; // Condition 2
    }

    for (let i = 0; i < pincode.length - 2; i++) {
      const currentDigit = parseInt(pincode[i]);
      const nextDigit = parseInt(pincode[i + 1]);
      const nextNextDigit = parseInt(pincode[i + 2]);

      if (
        (currentDigit + 1 === nextDigit && nextDigit + 1 === nextNextDigit) ||
        (currentDigit - 1 === nextDigit && nextDigit - 1 === nextNextDigit)
      ) {
        return false; // Condition 3
      }
    }

    const repeatedGroups = pincode.match(/(\d)\1+/g) || [];
    if (
      repeatedGroups.length > 2 ||
      repeatedGroups.some((group) => group.length > 2)
    ) {
      return false; // Condition 4
    }

    return true; // All conditions passed
  }
}
