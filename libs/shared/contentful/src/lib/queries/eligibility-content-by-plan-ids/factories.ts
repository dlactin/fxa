/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { EligibilityContentByPlanIdsQuery } from '../../../__generated__/graphql';
import {
  EligibilityOfferingResult,
  EligibilitySubgroupOfferingResult,
  EligibilitySubgroupResult,
} from '.';

export const EligibilityContentByPlanIdsQueryFactory = (
  override?: Partial<EligibilityContentByPlanIdsQuery>
): EligibilityContentByPlanIdsQuery => {
  return {
    purchaseCollection: {
      items: [
        {
          stripePlanChoices: [faker.string.sample()],
          offering: EligibilityOfferingResultFactory(),
        },
      ],
    },
    ...override,
  };
};

export const EligibilityOfferingResultFactory = (
  override?: Partial<EligibilityOfferingResult>
): EligibilityOfferingResult => ({
  stripeProductId: faker.string.sample(),
  countries: [faker.string.sample()],
  linkedFrom: {
    subGroupCollection: {
      items: [EligibilitySubgroupResultFactory()],
    },
  },
  ...override,
});

export const EligibilitySubgroupResultFactory = (
  override?: Partial<EligibilitySubgroupResult>
): EligibilitySubgroupResult => ({
  groupName: faker.string.sample(),
  offeringCollection: {
    items: [EligibilitySubgroupOfferingResultFactory()],
  },
  ...override,
});

export const EligibilitySubgroupOfferingResultFactory = (
  override?: Partial<EligibilitySubgroupOfferingResult>
): EligibilitySubgroupOfferingResult => ({
  stripeProductId: faker.string.sample(),
  countries: [faker.string.sample()],
  ...override,
});
