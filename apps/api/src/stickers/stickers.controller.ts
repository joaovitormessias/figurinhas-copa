import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { ListStickersQueryDto } from './dto/list-stickers-query.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { StickersService } from './stickers.service';

@Controller()
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  @Get('stickers')
  listPublic(@Query() query: ListStickersQueryDto) {
    return this.stickersService.listActive(query);
  }

  @Get('stickers/:id')
  getPublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.stickersService.getActiveById(id);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Post('admin/stickers')
  createAdmin(@Body() body: CreateStickerDto) {
    return this.stickersService.create(body);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/stickers/:id')
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStickerDto,
  ) {
    return this.stickersService.update(id, body);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/stickers/:id/activate')
  activateAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.stickersService.activate(id);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/stickers/:id/deactivate')
  deactivateAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.stickersService.deactivate(id);
  }
}
