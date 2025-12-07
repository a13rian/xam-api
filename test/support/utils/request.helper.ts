import request, { Test } from 'supertest';
import { TestContext } from '../test-app';
import { TestUser } from '../auth/auth.helper';

export class RequestHelper {
  constructor(private readonly ctx: TestContext) {}

  get(path: string, user?: TestUser | { accessToken: string }): Test {
    const req = request(this.ctx.server).get(`/api${path}`);
    if (user) {
      req.set('Authorization', `Bearer ${user.accessToken}`);
    }
    return req;
  }

  post(
    path: string,
    body: object,
    user?: TestUser | { accessToken: string },
  ): Test {
    const req = request(this.ctx.server).post(`/api${path}`).send(body);
    if (user) {
      req.set('Authorization', `Bearer ${user.accessToken}`);
    }
    return req;
  }

  patch(
    path: string,
    body: object,
    user?: TestUser | { accessToken: string },
  ): Test {
    const req = request(this.ctx.server).patch(`/api${path}`).send(body);
    if (user) {
      req.set('Authorization', `Bearer ${user.accessToken}`);
    }
    return req;
  }

  delete(path: string, user?: TestUser | { accessToken: string }): Test {
    const req = request(this.ctx.server).delete(`/api${path}`);
    if (user) {
      req.set('Authorization', `Bearer ${user.accessToken}`);
    }
    return req;
  }
}
