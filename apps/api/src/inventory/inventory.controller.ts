import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateAdminStockDto } from './dto/create-admin-stock.dto';
import { UpdateAdminStockDto } from './dto/update-admin-stock.dto';
import { UpdateInventoryVisibilityDto } from './dto/update-inventory-visibility.dto';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('inventory/public')
  listPublic() {
    return this.inventoryService.listPublic();
  }

  @Get('inventory/public/:id')
  getPublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getPublicById(id);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Post('admin/inventory')
  createAdmin(@Body() body: CreateAdminStockDto) {
    return this.inventoryService.create(body);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/inventory/:id')
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAdminStockDto,
  ) {
    return this.inventoryService.update(id, body);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/inventory/:id/visibility')
  updateVisibilityAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateInventoryVisibilityDto,
  ) {
    return this.inventoryService.updateVisibility(id, body.isVisible);
  }
}
