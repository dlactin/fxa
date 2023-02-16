/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { SupplicantInfo } from './supplicant-info';

describe('models/reliers/supplicant-info', function () {
  let context: ModelContext;
  let model: SupplicantInfo;

  beforeEach(function () {
    context = new GenericContext({});
    model = new SupplicantInfo(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});