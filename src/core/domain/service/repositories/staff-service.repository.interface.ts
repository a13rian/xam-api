import { StaffService } from '../entities/staff-service.entity';

export const STAFF_SERVICE_REPOSITORY = Symbol('STAFF_SERVICE_REPOSITORY');

export interface IStaffServiceRepository {
  findById(id: string): Promise<StaffService | null>;
  findByStaffId(staffId: string): Promise<StaffService[]>;
  findByServiceId(serviceId: string): Promise<StaffService[]>;
  findByStaffIdAndServiceId(
    staffId: string,
    serviceId: string,
  ): Promise<StaffService | null>;
  save(staffService: StaffService): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByStaffIdAndServiceId(
    staffId: string,
    serviceId: string,
  ): Promise<void>;
}
