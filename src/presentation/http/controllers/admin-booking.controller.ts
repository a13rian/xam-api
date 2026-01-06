import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  ListAllBookingsQueryDto,
  AdminUpdateBookingStatusDto,
  AdminCancelBookingDto,
} from '../dto/admin/admin-booking.dto';
import { BookingResponseDto, BookingsListResponseDto } from '../dto/booking';
import { ListAllBookingsQuery } from '../../../core/application/booking/queries';
import { GetBookingQuery } from '../../../core/application/booking/queries';
import {
  AdminCancelBookingCommand,
  AdminUpdateBookingStatusCommand,
} from '../../../core/application/booking/commands';

@ApiTags('admin/bookings')
@Controller('admin/bookings')
export class AdminBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.BOOKING.LIST)
  @ApiOperation({
    summary: 'List all bookings',
    description: 'List all bookings with filters and pagination (admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listAllBookings(
    @Query() query: ListAllBookingsQueryDto,
  ): Promise<BookingsListResponseDto> {
    return await this.queryBus.execute(
      new ListAllBookingsQuery(
        query.status,
        query.customerId,
        query.organizationId,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
        query.search,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.BOOKING.READ)
  @ApiOperation({
    summary: 'Get booking details',
    description: 'Get booking details by ID (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async getBooking(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.queryBus.execute<
      GetBookingQuery,
      BookingResponseDto | null
    >(new GetBookingQuery(id));

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.BOOKING.UPDATE)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update booking status',
    description: 'Force update booking status (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateBookingStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    return await this.commandBus.execute(
      new AdminUpdateBookingStatusCommand(id, dto.status, user.id),
    );
  }

  @Post(':id/cancel')
  @RequirePermissions(PERMISSIONS.BOOKING.DELETE)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel a booking with reason (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminCancelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookingResponseDto> {
    return await this.commandBus.execute(
      new AdminCancelBookingCommand(id, user.id, dto.reason),
    );
  }
}
