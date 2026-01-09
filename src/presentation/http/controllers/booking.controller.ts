import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
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
        dto.accountId,
        new Date(dto.scheduledDate),
        dto.startTime,
        dto.services.map((s) => ({ serviceId: s.serviceId })),
        dto.isHomeService ?? false,
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
    @Param('id') id: string,
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
    @Param('id') id: string,
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
    @Param('id') id: string,
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

interface ProviderContext {
  type: 'organization' | 'individual';
  organizationId?: string;
  accountId?: string;
}

@Controller('partners/me/bookings')
export class PartnerBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Get provider context for the current user.
   * Supports both Business (Organization) and Individual accounts.
   */
  private async getProviderContext(userId: string): Promise<ProviderContext> {
    const account = await this.queryBus.execute<
      GetMyAccountQuery,
      AccountResponseDto | null
    >(new GetMyAccountQuery(userId));

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Business account with organization
    if (account.type === 'business' && account.organization?.id) {
      return {
        type: 'organization',
        organizationId: account.organization.id,
      };
    }

    // Individual account
    if (account.type === 'individual') {
      return {
        type: 'individual',
        accountId: account.id,
      };
    }

    throw new NotFoundException(
      'No valid provider context found. Account must be Business with Organization or Individual.',
    );
  }

  @Get()
  async listBookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPartnerBookingsQueryDto,
  ): Promise<BookingsListResponseDto> {
    const context = await this.getProviderContext(user.id);

    return await this.queryBus.execute<
      ListPartnerBookingsQuery,
      BookingsListResponseDto
    >(
      new ListPartnerBookingsQuery(
        context.organizationId,
        context.accountId,
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
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    const context = await this.getProviderContext(user.id);

    const booking = await this.queryBus.execute<
      GetBookingQuery,
      BookingResponseDto | null
    >(new GetBookingQuery(id));
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Ensure provider can only see their own bookings
    const isOwner =
      (context.type === 'organization' &&
        booking.organizationId === context.organizationId) ||
      (context.type === 'individual' &&
        booking.accountId === context.accountId);

    if (!isOwner) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Post(':id/confirm')
  @HttpCode(200)
  async confirmBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    const context = await this.getProviderContext(user.id);
    return await this.commandBus.execute(
      new ConfirmBookingCommand(id, context.organizationId, context.accountId),
    );
  }

  @Post(':id/start')
  @HttpCode(200)
  async startBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    const context = await this.getProviderContext(user.id);
    return await this.commandBus.execute(
      new StartBookingCommand(id, context.organizationId, context.accountId),
    );
  }

  @Post(':id/complete')
  @HttpCode(200)
  async completeBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookingResponseDto> {
    const context = await this.getProviderContext(user.id);
    return await this.commandBus.execute(
      new CompleteBookingCommand(id, context.organizationId, context.accountId),
    );
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancelBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const context = await this.getProviderContext(user.id);
    return await this.commandBus.execute(
      new CancelBookingCommand(
        id,
        context.organizationId ?? context.accountId!,
        dto.reason,
        true,
      ),
    );
  }

  @Post(':id/reschedule')
  @HttpCode(200)
  async rescheduleBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ): Promise<void> {
    const context = await this.getProviderContext(user.id);
    await this.commandBus.execute(
      new RescheduleBookingCommand(
        id,
        context.organizationId ?? context.accountId!,
        true,
        new Date(dto.newDate),
        dto.newStartTime,
      ),
    );
  }
}
