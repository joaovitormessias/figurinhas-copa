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
  CancelOfferByAdminDto,
  CancelOfferByUserDto,
} from './dto/cancel-offer.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { MyOffersQueryDto } from './dto/my-offers-query.dto';
import { OfferActionDto } from './dto/offer-action.dto';
import { OffersService } from './offers.service';

@Controller()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('offers')
  create(@Body() body: CreateOfferDto) {
    return this.offersService.createOffer(body);
  }

  @Get('offers/my')
  listMine(@Query() query: MyOffersQueryDto) {
    return this.offersService.listMyOffers(query.userId);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Get('admin/offers')
  listAdmin() {
    return this.offersService.listAdminOffers();
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Get('admin/offers/:id')
  getAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.offersService.getAdminOffer(id);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/offers/:id/under-review')
  markUnderReviewAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OfferActionDto,
  ) {
    return this.offersService.markUnderReview(id, body.adminNote);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/offers/:id/accept')
  acceptAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OfferActionDto,
  ) {
    return this.offersService.acceptOffer(
      id,
      body.adminFinalPrice,
      body.adminNote,
    );
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/offers/:id/reject')
  rejectAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OfferActionDto,
  ) {
    return this.offersService.rejectOffer(id, body.adminNote);
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/offers/:id/cancel')
  cancelAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelOfferByAdminDto,
  ) {
    return this.offersService.cancelOfferByAdmin(
      id,
      body.cancellationReason,
      body.adminNote,
    );
  }

  // TODO: Apply admin guard when authentication and authorization are implemented.
  @Patch('admin/offers/:id/complete')
  completeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OfferActionDto,
  ) {
    return this.offersService.completeOffer(
      id,
      body.adminFinalPrice,
      body.adminNote,
    );
  }

  @Patch('offers/:id/cancel')
  cancelMine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelOfferByUserDto,
  ) {
    return this.offersService.cancelOfferByUser(
      id,
      body.userId,
      body.cancellationReason,
    );
  }
}
