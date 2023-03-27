import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Patch,
  Delete,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import { ProductParamsDto } from './dto/productParams.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { addProductDto } from './dto/addProduct.dto';
import { Response } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('streamable')
  async streamable(@Res({ passthrough: true }) response: Response) {
    const file = await this.productService.downloadFile();
    response.send(file);
    return new StreamableFile(file);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.productService.findOneProduct(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  addProduct(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 }),
          new FileTypeValidator({ fileType: '(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() addProductDto: addProductDto,
  ) {
    console.log(addProductDto);
    return this.productService.addProduct(file, addProductDto);
  }

  @Get('all')
  getProducts(): Promise<ProductDto[]> {
    return this.productService.getProducts();
  }

  @Get('cursor')
  getProductsCurosr(
    @Query('take') take: number,
    @Query('cursor') cursor: number,
  ): Promise<ProductDto[]> {
    return this.productService.getProductsCursor({
      take,
      cursor,
    });
  }

  @Get('params')
  getProductWithParams(@Query() query: ProductParamsDto) {
    return this.productService.getProductWithParams(query);
  }

  @Get('offset')
  getProductsOffset(@Param('id') id: string): Promise<ProductDto[]> {
    return this.productService.getProductsOffset(id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() productDto: ProductDto,
  ): Promise<ProductDto> {
    return this.productService.updateProduct(id, productDto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string): Promise<ProductDto> {
    return this.productService.deleteProduct(id);
  }
}
