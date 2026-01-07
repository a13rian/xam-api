export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DailyUserGrowth {
  date: string;
  users: number;
  companions: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface DailyBookingStats {
  date: string;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface BookingsByStatus {
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  activeCompanions: number;
  pendingApprovals: number;
  totalBookings: number;
  totalRevenue: number;
  bookingsByStatus: BookingsByStatus;
  userGrowth: DailyUserGrowth[];
  revenueData: DailyRevenue[];
  bookingData: DailyBookingStats[];
}

export interface IDashboardRepository {
  getDashboardStats(startDate?: Date, endDate?: Date): Promise<DashboardStats>;
}
