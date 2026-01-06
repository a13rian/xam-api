export class AdminDashboardStatsResponseDto {
  totalUsers: number;
  totalAccounts: number;
  activeCompanions: number;
  pendingApprovals: number;
  totalBookings: number;
  totalRevenue: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  userGrowth: Array<{
    date: string;
    users: number;
    companions: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  bookingData: Array<{
    date: string;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>;
}

export class RecentActivityQueryDto {
  limit?: number;
}

export class RecentActivityResponseDto {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
  }>;
  accounts: Array<{
    id: string;
    displayName: string;
    type: string;
    status: string;
    createdAt: Date;
  }>;
  bookings: Array<{
    id: string;
    customerName: string;
    companionName?: string;
    status: string;
    createdAt: Date;
  }>;
}
