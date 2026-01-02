import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  CreateBookingDto,
  ListCustomerBookingsQueryDto,
  ListPartnerBookingsQueryDto,
  CancelBookingDto,
  BookingResponseDto,
  BookingsListResponseDto,
  RescheduleBookingDto,
  CustomerBookingStatsQueryDto,
  CustomerBookingStatsResponseDto,
} from '../dto/booking';
import {
  CreateBookingCommand,
  ConfirmBookingCommand,
  CancelBookingCommand,
  StartBookingCommand,
  CompleteBookingCommand,
  RescheduleBookingCommand,
} from '../../../core/application/booking/commands';
import {
  GetBookingQuery,
  ListCustomerBookingsQuery,
  ListPartnerBookingsQuery,
  GetCustomerBookingStatsQuery,
} from '../../../core/application/booking/queries';
import { CustomerStatsResult } from '../../../core/domain/booking/repositories/booking.repository.interface';
import { GetMyAccountQuery } from '../../../core/application/account/queries';
import { AccountResponseDto } from '../dto/account';

@Controller('bookings')
export class CustomerBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return await this.commandBus.execute<
      CreateBookingCommand,
      BookingResponseDto
    >(
      new CreateBookingCommand(
        user.id,
        dto.organizationId,
        dto.locationId,
        new Date(dto.scheduledDate),
        dto.startTime,
        dto.services.map((s) => ({ serviceId: s.serviceId })),
        dto.customerPhone,
        dto.customerName,
        dto.staffId,
        dto.isHomeService ?? false,
        dto.customerAddress,
        dto.notes,
      ),
    );
  }

  @Get('me')
  async listMyBookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCustomerBookingsQueryDto,
  ): Promise<BookingsListResponseDto> {
    return await this.queryBus.execute<
      ListCustomerBookingsQuery,
      BookingsListResponseDto
    >(
      new ListCustomerBookingsQuery(
        user.id,
        query.status,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
        query.page,
        query.limit,
      ),
    );
  }

  @Get('me/stats')
  async getMyBookingStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CustomerBookingStatsQueryDto,
  ): Promise<CustomerBookingStatsResponseDto> {
    return await this.queryBus.execute<
      GetCustomerBookingStatsQuery,
      CustomerStatsResult
    >(
      new GetCustomerBookingStatsQuery(
        user.id,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
      ),
    );
  }

  @Get(':id')
  async getBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.queryBus.execute<
      GetBookingQuery,
      BookingResponseDto | null
    >(new GetBookingQuery(id));
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    // Ensure customer can only see their own bookings
    if (booking.customerId !== user.id) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancelBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return await this.commandBus.execute(
      new CancelBookingCommand(id, user.id, dto.reason, false),
    );
  }

  @Post(':id/reschedule')
  @HttpCode(200)
  async rescheduleBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleBookingDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new RescheduleBookingCommand(
        id,
        user.id,
        false,
        new Date(dto.newDate),
        dto.newStartTime,
      ),
    );
  }
}

@Controller('partners/me/bookings')
export class PartnerBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async getOrganizationId(userId: string): Promise<string> {
    const account = await this.queryBus.execute<
      GetMyAccountQuery,
      AccountResponseDto | null
    >(new GetMyAccountQuery(userId));
    if (!account || !account.organization?.id) {
      throw new NotFoundException('Organization not found');
    }
    return account.organization.id;
  }

  @Get()
  async listBookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPartnerBookingsQueryDto,
  ): Promise<BookingsListResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    return await this.queryBus.execute<
      ListPartnerBookingsQuery,
      BookingsListResponseDto
    >(
      new ListPartnerBookingsQuery(
        organizationId,
        query.status,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  async getBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);

    const booking = await this.queryBus.execute<
      GetBookingQuery,
      BookingResponseDto | null
    >(new GetBookingQuery(id));
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    // Ensure organization can only see their own bookings
    if (booking.organizationId !== organizationId) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Post(':id/confirm')
  @HttpCode(200)
  async confirmBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.commandBus.execute(
      new ConfirmBookingCommand(id, organizationId),
    );
  }

  @Post(':id/start')
  @HttpCode(200)
  async startBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.commandBus.execute(
      new StartBookingCommand(id, organizationId),
    );
  }

  @Post(':id/complete')
  @HttpCode(200)
  async completeBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.commandBus.execute(
      new CompleteBookingCommand(id, organizationId),
    );
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancelBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const organizationId = await this.getOrganizationId(user.id);
    return await this.commandBus.execute(
      new CancelBookingCommand(id, organizationId, dto.reason, true),
    );
  }

  @Post(':id/reschedule')
  @HttpCode(200)
  async rescheduleBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleBookingDto,
  ): Promise<void> {
    const organizationId = await this.getOrganizationId(user.id);
    await this.commandBus.execute(
      new RescheduleBookingCommand(
        id,
        organizationId,
        true,
        new Date(dto.newDate),
        dto.newStartTime,
      ),
    );
  }
}
