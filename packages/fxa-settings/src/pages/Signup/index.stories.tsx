/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopIntegration,
  createMockSignupWebIntegration,
  mockBeginSignupHandler,
  signupQueryParams,
} from './mocks';
import { SignupProps } from './interfaces';
import { SignupQueryParams } from '../../models/pages/signup';
import { mockUrlQueryData } from '../../models/mocks';
import {
  MONITOR_CLIENTIDS,
  POCKET_CLIENTIDS,
} from '../../models/integrations/client-matching';
import { getSyncEngineIds } from '../../components/ChooseWhatToSync/sync-engines';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const urlQueryData = mockUrlQueryData(signupQueryParams);
const queryParamModel = new SignupQueryParams(urlQueryData);

const storyWithProps = (props?: Partial<SignupProps>) => {
  const story = () => (
    <LocationProvider>
      <Signup
        {...{
          integration: createMockSignupWebIntegration(),
          queryParamModel,
          beginSignupHandler: mockBeginSignupHandler,
          webChannelEngines: getSyncEngineIds(),
          isSyncMobileWebChannel: false,
          isSync: false,
          ...props,
        }}
      />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const CantChangeEmail = storyWithProps({
  integration: createMockSignupOAuthIntegration(),
});

export const ClientIsPocket = storyWithProps({
  integration: createMockSignupOAuthIntegration(POCKET_CLIENTIDS[0]),
});

export const ClientIsMonitor = storyWithProps({
  integration: createMockSignupOAuthIntegration(MONITOR_CLIENTIDS[0]),
});

export const ChooseWhatToSyncIsEnabled = storyWithProps({
  integration: createMockSignupSyncDesktopIntegration(),
  isSync: true,
});
