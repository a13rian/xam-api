import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
  GetRecentActivityQuery,
  RecentActivityResult,
} from './get-recent-activity.query';

@Injectable()
@QueryHandler(GetRecentActivityQuery)
export class GetRecentActivityHandler implements IQueryHandler<
  GetRecentActivityQuery,
  RecentActivityResult
> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(_query: GetRecentActivityQuery): Promise<RecentActivityResult> {
    // TODO: Implement actual query to repositories
    return Promise.resolve({
      users: [],
      accounts: [],
      bookings: [],
    });
  }
}
