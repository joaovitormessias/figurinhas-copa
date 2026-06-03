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
import {
  CancelOrderByAdminDto,
  CancelOrderByUserDto,
} from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { MyOrdersQueryDto } from './dto/my-orders-query.dto';
import { OrderActionDto } from './dto/order-action.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  create(@Body() body: CreateOrderDto) {
    return this.ordersService.createOrderWithReservation(body);
  }

  @Get('orders/my')
  listMine(@Query() query: MyOrdersQueryDto) {
    return this.ordersService.listMyOrders(query.userId);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Get('admin/orders')
  listAdmin() {
    return this.ordersService.listAdminOrders();
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Get('admin/orders/:id')
  getAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getAdminOrder(id);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/orders/:id/approve')
  approveAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    return this.ordersService.approveOrder(
      id,
      body.adminNote,
      body.actorUserId,
    );
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/orders/:id/reject')
  rejectAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    return this.ordersService.rejectOrder(id, body.adminNote, body.actorUserId);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/orders/:id/complete')
  completeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    return this.ordersService.completeOrder(
      id,
      body.adminNote,
      body.actorUserId,
    );
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/orders/:id/cancel')
  cancelAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelOrderByAdminDto,
  ) {
    return this.ordersService.cancelOrderByAdmin(
      id,
      body.cancellationReason,
      body.adminNote,
      body.actorUserId,
    );
  }

  @Patch('orders/:id/cancel')
  cancelMine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelOrderByUserDto,
  ) {
    return this.ordersService.cancelOrderByUser(
      id,
      body.userId,
      body.cancellationReason,
    );
  }
}
