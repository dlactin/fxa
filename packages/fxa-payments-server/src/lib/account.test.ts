/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { cleanup } from '@testing-library/react';
import {
  apiCreatePasswordlessAccount,
  updateAPIClientToken,
} from './apiClient';
import { FXA_SIGNUP_ERROR, handlePasswordlessSignUp } from './account';
import sentry from './sentry';
import { AuthServerErrno } from './errors';
import { MOCK_EVENTS } from '../lib/mock-data';
import { ReactGALog } from '../lib/reactga-event';

jest.mock('./apiClient', () => ({
  apiCreatePasswordlessAccount: jest
    .fn()
    .mockResolvedValue({ uid: 'wibble', access_token: 'quux' }),
  updateAPIClientToken: jest.fn(),
}));
jest.mock('./sentry', () => ({
  __esModule: true,
  default: { captureException: jest.fn() },
}));
jest.mock('../lib/reactga-event');

const accountParam = { email: 'me@example.com', clientId: 'tests' };

beforeEach(() => {
  (apiCreatePasswordlessAccount as jest.Mock).mockClear();
  (updateAPIClientToken as jest.Mock).mockClear();
  (sentry.captureException as jest.Mock).mockClear();
  (ReactGALog.logEvent as jest.Mock).mockClear();
  return cleanup();
});

describe('lib/account', () => {
  describe('handlePasswordlessSignUp', () => {
    it('updates the API client token on success', async () => {
      await handlePasswordlessSignUp(accountParam);
      expect(updateAPIClientToken).toBeCalledWith('quux');
      expect(ReactGALog.logEvent).toBeCalledTimes(1);
      expect(ReactGALog.logEvent).toBeCalledWith(MOCK_EVENTS.SignUp);
    });

    it('throws an error on failure', async () => {
      (apiCreatePasswordlessAccount as jest.Mock)
        .mockReset()
        .mockRejectedValue(FXA_SIGNUP_ERROR);
      await expect(handlePasswordlessSignUp(accountParam)).rejects.toBe(
        FXA_SIGNUP_ERROR
      );
      expect(updateAPIClientToken).not.toHaveBeenCalled();
      expect(sentry.captureException).toHaveBeenCalledWith(FXA_SIGNUP_ERROR);
      expect(ReactGALog.logEvent).not.toBeCalledWith(MOCK_EVENTS.SignUp);
    });

    it('throws an error, but no sentry exception, on account already exists', async () => {
      (apiCreatePasswordlessAccount as jest.Mock)
        .mockReset()
        .mockRejectedValue({ body: { errno: AuthServerErrno.ACCOUNT_EXISTS } });
      await expect(handlePasswordlessSignUp(accountParam)).rejects.toBe(
        FXA_SIGNUP_ERROR
      );
      expect(updateAPIClientToken).not.toHaveBeenCalled();
      expect(sentry.captureException).not.toHaveBeenCalled();
      expect(ReactGALog.logEvent).not.toBeCalledWith(MOCK_EVENTS.SignUp);
    });
  });
});
