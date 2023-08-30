import { IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'กรุณาป้อนรหัสสินค้า' })
  product_id: string;

  @IsNotEmpty({ message: 'กรุณาป้อนชื่อสินค้า' })
  name: string;

  @IsNotEmpty({ message: 'กรุณาป้อนน้ำหนักสินค้า' })
  weight: number;

  dimension: {
    lenght: number;

    width: number;

    height: number;
  };

  image: string[];

  @IsNotEmpty({ message: 'กรุณาป้อนรหัสเอสเคยู' })
  sku_id: string;
}
