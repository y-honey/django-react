import { DefaultBodyType, PathParams, rest } from 'msw';
import {
  ConfirmPasswordResetRequestData,
  ConfirmPasswordResetResponseData,
  RequestPasswordResetRequestData,
  RequestPasswordResetResponseData,
} from '../../../shared/services/api/auth/types';
import { AUTH_PASSWORD_RESET_URL, AUTH_URL } from '../../../shared/services/api/auth';

export const mockRefreshToken = (status = 200) =>
  rest.post<DefaultBodyType, PathParams, DefaultBodyType>(AUTH_URL.REFRESH_TOKEN, (req, res, ctx) => {
    return res(ctx.status(status));
  });

export const mockLogout = (status = 200) =>
  rest.post<never, PathParams, any>(AUTH_URL.LOGOUT, (req, res, ctx) => {
    return res(ctx.status(status));
  });

export const mockRequestPasswordReset = (
  response: RequestPasswordResetResponseData = { isError: false },
  status = 200
) =>
  rest.post<RequestPasswordResetRequestData, PathParams, RequestPasswordResetResponseData>(
    AUTH_PASSWORD_RESET_URL.REQUEST,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );

export const mockConfirmPasswordReset = (
  response: ConfirmPasswordResetResponseData = { isError: false },
  status = 200,
  promise?: Promise<void>
) =>
  rest.post<ConfirmPasswordResetRequestData, PathParams, ConfirmPasswordResetResponseData>(
    AUTH_PASSWORD_RESET_URL.CONFIRM,
    async (req, res, ctx) => {
      if (promise) {
        await promise;
      }
      return res(ctx.status(status), ctx.json(response));
    }
  );
