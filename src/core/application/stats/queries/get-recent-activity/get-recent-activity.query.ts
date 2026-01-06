export class GetRecentActivityQuery {
  constructor(public readonly limit: number = 10) {}
}

export interface RecentActivityResult {
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
