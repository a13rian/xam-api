import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
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
import {
  PARTNER_LOCATION_REPOSITORY,
  IPartnerLocationRepository,
} from '../../../../domain/location/repositories/partner-location.repository.interface';
import {
  ACCOUNT_REPOSITORY,
  IAccountRepository,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  ACCOUNT_SERVICE_REPOSITORY,
  IAccountServiceRepository,
} from '../../../../domain/account-service/repositories/account-service.repository.interface';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Account } from '../../../../domain/account/entities/account.entity';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PARTNER_LOCATION_REPOSITORY)
    private readonly locationRepository: IPartnerLocationRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ACCOUNT_SERVICE_REPOSITORY)
    private readonly accountServiceRepository: IAccountServiceRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateBookingCommand) {
    // 1. Fetch customer (logged-in user)
    const customer = await this.userRepository.findById(command.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // 2. Fetch provider account
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Provider account not found');
    }
    if (!account.canOperate()) {
      throw new BadRequestException(
        'Provider account is not active or approved',
      );
    }

    // 3. Validate scheduled date is not in the past
    this.validateScheduledDate(command.scheduledDate);

    // 4. Validate at least one service
    if (command.services.length === 0) {
      throw new BadRequestException('At least one service is required');
    }

    // 5. Route to appropriate handler based on account type
    if (account.organizationId) {
      return this.executeBusinessBooking(command, account, customer);
    } else if (account.isIndividual()) {
      return this.executeIndividualBooking(command, account, customer);
    }

    throw new BadRequestException('Invalid account type');
  }

  /**
   * Handle booking for Business (Organization) providers
   */
  private async executeBusinessBooking(
    command: CreateBookingCommand,
    account: Account,
    customer: User,
  ) {
    const organizationId = account.organizationId!;

    // 1. Validate organization
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!organization.status.isActive()) {
      throw new BadRequestException('Organization is not active');
    }

    // 2. Determine address and location based on isHomeService
    let customerAddress: string | undefined;
    let locationId: string | undefined;

    if (command.isHomeService) {
      if (!organization.isHomeServiceEnabled) {
        throw new BadRequestException(
          'Organization does not offer home service',
        );
      }
      // Use customer's address for home service
      customerAddress = customer.fullAddress ?? undefined;
      if (!customerAddress) {
        throw new BadRequestException(
          'Customer address is required for home service. Please update your profile.',
        );
      }
    } else {
      // Use organization's primary location
      const primaryLocation =
        await this.locationRepository.findPrimaryByPartnerId(organizationId);
      if (!primaryLocation || !primaryLocation.isActive) {
        throw new BadRequestException(
          'No active primary location found for this organization',
        );
      }
      locationId = primaryLocation.id;
      customerAddress = primaryLocation.address.fullAddress;
    }

    // 3. Validate services - all must be organization services (srv_* prefix)
    const serviceIds = command.services.map((s) => {
      if (!this.isOrganizationService(s.serviceId)) {
        throw new BadRequestException(
          `Service ${s.serviceId} is not a valid organization service. Business bookings require services with srv_ prefix.`,
        );
      }
      return s.serviceId;
    });

    // 4. Batch load all services (N+1 prevention)
    const services = await this.serviceRepository.findByIds(serviceIds);
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Validate all services exist
    const missingServiceIds = serviceIds.filter((id) => !serviceMap.has(id));
    if (missingServiceIds.length > 0) {
      throw new NotFoundException(
        `Services not found: ${missingServiceIds.join(', ')}`,
      );
    }

    // 5. Build booking services
    let totalAmount = 0;
    let totalDuration = 0;
    const bookingServices: BookingService[] = [];
    const bookingId = `bok_${createId()}`;

    for (const serviceInput of command.services) {
      const service = serviceMap.get(serviceInput.serviceId)!;

      if (service.organizationId !== organizationId) {
        throw new BadRequestException(
          `Service ${service.name} does not belong to this organization`,
        );
      }
      if (!service.isActive) {
        throw new BadRequestException(`Service ${service.name} is not active`);
      }

      totalAmount += service.price.amount;
      totalDuration += service.durationMinutes;

      bookingServices.push(
        BookingService.create({
          id: `bks_${createId()}`,
          bookingId,
          serviceId: service.id,
          serviceName: service.name,
          price: service.price.amount,
          currency: service.price.currency,
          durationMinutes: service.durationMinutes,
        }),
      );
    }

    // 6. Calculate end time
    const endTime = this.calculateEndTime(command.startTime, totalDuration);

    // 7. Create booking with customer info from User entity
    const booking = Booking.create({
      id: bookingId,
      customerId: command.customerId,
      organizationId,
      locationId,
      scheduledDate: command.scheduledDate,
      startTime: command.startTime,
      endTime,
      totalAmount,
      currency: 'VND',
      isHomeService: command.isHomeService,
      customerAddress,
      customerPhone: customer.phone ?? '',
      customerName: customer.fullName,
      notes: command.notes,
      services: bookingServices,
    });

    await this.bookingRepository.save(booking);

    return booking.toObject();
  }

  /**
   * Handle booking for Individual providers
   */
  private async executeIndividualBooking(
    command: CreateBookingCommand,
    account: Account,
    customer: User,
  ) {
    // 1. Determine address based on isHomeService
    let customerAddress: string | undefined;

    if (command.isHomeService) {
      // Use customer's address for home service
      customerAddress = customer.fullAddress ?? undefined;
      if (!customerAddress) {
        throw new BadRequestException(
          'Customer address is required for home service. Please update your profile.',
        );
      }
    } else {
      // Use individual account's address
      customerAddress = account.fullAddress ?? undefined;
      if (!customerAddress) {
        throw new BadRequestException(
          'Provider does not have an address configured. Please contact the provider.',
        );
      }
    }

    // 2. Validate services - all must be account services (asv_* prefix)
    const accountServiceIds = command.services.map((s) => {
      if (!this.isAccountService(s.serviceId)) {
        throw new BadRequestException(
          `Service ${s.serviceId} is not a valid account service. Individual bookings require services with asv_ prefix.`,
        );
      }
      return s.serviceId;
    });

    // 3. Batch load all account services (N+1 prevention)
    const accountServices =
      await this.accountServiceRepository.findByIds(accountServiceIds);
    const serviceMap = new Map(accountServices.map((s) => [s.id, s]));

    // Validate all services exist
    const missingServiceIds = accountServiceIds.filter(
      (id) => !serviceMap.has(id),
    );
    if (missingServiceIds.length > 0) {
      throw new NotFoundException(
        `Account services not found: ${missingServiceIds.join(', ')}`,
      );
    }

    // 4. Build booking services
    let totalAmount = 0;
    let totalDuration = 0;
    const bookingServices: BookingService[] = [];
    const bookingId = `bok_${createId()}`;

    for (const serviceInput of command.services) {
      const service = serviceMap.get(serviceInput.serviceId)!;

      // Validate service belongs to this account
      if (service.accountId !== account.id) {
        throw new BadRequestException(
          `Service ${service.name} does not belong to this account`,
        );
      }
      if (!service.isActive) {
        throw new BadRequestException(`Service ${service.name} is not active`);
      }

      totalAmount += service.price.amount;
      totalDuration += service.durationMinutes;

      bookingServices.push(
        BookingService.create({
          id: `bks_${createId()}`,
          bookingId,
          accountServiceId: service.id,
          serviceName: service.name,
          price: service.price.amount,
          currency: service.price.currency,
          durationMinutes: service.durationMinutes,
        }),
      );
    }

    // 5. Calculate end time
    const endTime = this.calculateEndTime(command.startTime, totalDuration);

    // 6. Create booking with customer info from User entity
    const booking = Booking.create({
      id: bookingId,
      customerId: command.customerId,
      accountId: account.id,
      scheduledDate: command.scheduledDate,
      startTime: command.startTime,
      endTime,
      totalAmount,
      currency: 'VND',
      isHomeService: command.isHomeService,
      customerAddress,
      customerPhone: customer.phone ?? '',
      customerName: customer.fullName,
      notes: command.notes,
      services: bookingServices,
    });

    await this.bookingRepository.save(booking);

    return booking.toObject();
  }

  /**
   * Check if service ID is an Organization service (srv_* prefix)
   */
  private isOrganizationService(serviceId: string): boolean {
    return serviceId.startsWith('srv_');
  }

  /**
   * Check if service ID is an Account service (asv_* prefix)
   */
  private isAccountService(serviceId: string): boolean {
    return serviceId.startsWith('asv_');
  }

  /**
   * Validate scheduled date is not in the past
   */
  private validateScheduledDate(scheduledDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(scheduledDate);
    bookingDate.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      throw new BadRequestException('Cannot book for past dates');
    }
  }

  /**
   * Calculate end time from start time and duration
   */
  private calculateEndTime(startTime: string, totalDuration: number): string {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMinute + totalDuration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  }
}
