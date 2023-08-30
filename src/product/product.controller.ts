import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { HttpResponse } from 'src/shared/interfaces/http-response.interface';
import { Product } from './interfaces/product.interface';

// can edit only employee roles
//auth don't have roles now maybe next time.
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<HttpResponse> {
    const createdProduct = await this.productService.create(createProductDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'การสร้างข้อมูลสินค้าสำเร็จ',
      data: createdProduct,
    };
  }

  @Get()
  async getProducts(): Promise<HttpResponse> {
    const product = await this.productService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'การเรียกดูข้อมูลสินค้าสำเร็จ',
      data: product,
    };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<HttpResponse> {
    const product = await this.productService.findOneById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'การเรียกดูข้อมูลสินค้าสำเร็จ',
      data: product,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createProductDto: CreateProductDto,
  ): Promise<HttpResponse> {
    const updatedProduct: Product = await this.productService.update(
      id,
      createProductDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'การปรับปรุงข้อมูลสินค้าสำเร็จ',
      data: updatedProduct,
    };
  }

  @Delete(':id')
  async deleteOneProduct(@Param('id') id: string): Promise<HttpResponse> {
    await this.productService.deleteOne(id);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'การลบข้อมูลสินค้าสำเร็จ',
    };
  }

  @Delete('softdelete/:id')
  async softDelete(@Param('id') id: string): Promise<HttpResponse> {
    const softDelete: Product = await this.productService.softDelete(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'การลบข้อมูลสินค้าสำเร็จ',
      data: softDelete,
    };
  }

  @Post('/validate_pincode/:pincode')
  async validate_pincode(
    @Param('pincode') pincode: string,
  ): Promise<HttpResponse> {
    const createdProduct = await this.productService.validate_pincode(pincode);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'การสร้างข้อมูลสินค้าสำเร็จ',
      data: createdProduct,
    };
  }
}
