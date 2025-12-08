import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingCommand } from './create-booking.command';
import { Booking } from '../../../../domain/booking/entities/booking.entity';
import { BookingService } from '../../../../domain/booking/entities/booking-service.entity';
import {
  BOOKING_REPOSITORY,
  IBookingRepository,
} from '../../../../domain/booking/repositories/booking.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(command: CreateBookingCommand) {
    // Validate partner
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    if (!partner.status.isActive()) {
      throw new BadRequestException('Partner is not active');
    }

    // Validate location
    const location = await this.locationRepository.findById(command.locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    if (location.partnerId !== command.partnerId) {
      throw new BadRequestException('Location does not belong to this partner');
    }

    // Validate home service
    if (command.isHomeService) {
      if (!partner.isHomeServiceEnabled) {
        throw new BadRequestException('Partner does not offer home service');
      }
      if (!command.customerAddress) {
        throw new BadRequestException(
          'Customer address is required for home service',
        );
      }
    }

    // Validate services and calculate totals
    if (command.services.length === 0) {
      throw new BadRequestException('At least one service is required');
    }

    let totalAmount = 0;
    let totalDuration = 0;
    const bookingServices: BookingService[] = [];
    const bookingId = uuidv4();

    for (const serviceInput of command.services) {
      const service = await this.serviceRepository.findById(
        serviceInput.serviceId,
      );
      if (!service) {
        throw new NotFoundException(
          `Service ${serviceInput.serviceId} not found`,
        );
      }
      if (service.partnerId !== command.partnerId) {
        throw new BadRequestException(
          'Service does not belong to this partner',
        );
      }
      if (!service.isActive) {
        throw new BadRequestException(`Service ${service.name} is not active`);
      }

      totalAmount += service.price.amount;
      totalDuration += service.durationMinutes;

      bookingServices.push(
        BookingService.create({
          id: uuidv4(),
          bookingId,
          serviceId: service.id,
          serviceName: service.name,
          price: service.price.amount,
          currency: service.price.currency,
          durationMinutes: service.durationMinutes,
        }),
      );
    }

    // Note: Wallet and payment check is done at confirmation time, not booking creation
    // This allows customers to create bookings and top up their wallet before confirmation

    // Calculate end time
    const [startHour, startMinute] = command.startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMinute + totalDuration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Create booking (status: PENDING, no payment deducted yet)
    const booking = Booking.create({
      id: bookingId,
      customerId: command.customerId,
      partnerId: command.partnerId,
      locationId: command.locationId,
      staffId: command.staffId,
      scheduledDate: command.scheduledDate,
      startTime: command.startTime,
      endTime,
      totalAmount,
      currency: 'VND',
      isHomeService: command.isHomeService ?? false,
      customerAddress: command.customerAddress,
      customerPhone: command.customerPhone ?? '',
      customerName: command.customerName ?? '',
      notes: command.notes,
      services: bookingServices,
    });

    await this.bookingRepository.save(booking);

    return booking.toObject();
  }
}
