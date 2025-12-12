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
  ORGANIZATION_REPOSITORY,
  IOrganizationRepository,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(command: CreateBookingCommand) {
    // Validate organization
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!organization.status.isActive()) {
      throw new BadRequestException('Organization is not active');
    }

    // Validate home service
    if (command.isHomeService) {
      if (!organization.isHomeServiceEnabled) {
        throw new BadRequestException(
          'Organization does not offer home service',
        );
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
      if (service.organizationId !== command.organizationId) {
        throw new BadRequestException(
          'Service does not belong to this organization',
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
      organizationId: command.organizationId,
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
