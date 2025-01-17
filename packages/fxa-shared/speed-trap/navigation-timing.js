/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  NAVIGATION_TIMING_FIELDS,
  OPTIONAL_NAVIGATION_TIMING_FIELDS,
} from './timing-fields';

const L2TimingsMap = {
  navigationStart: 'startTime',
  domLoading: 'domContentLoadedEventStart',
};

const TimingVersions = {
  L2: 'L2',
  L1: 'L1',
  UNKNOWN: '',
};

// Magic number indicating an invalid L1 navigation timing value came from the browser.
export const InvalidL1Val = -11111;

// Magic number indicating an invalid L2 navigation timing value came from the browser.
export const InvalidL2Val = -22222;

class NavigationTiming {
  init(opts) {
    // A performance api must be provided
    if (!opts || !opts.performance) {
      throw new Error('opts.performance is required!');
    }
    this.performance = opts.performance;
    this.useL1Timings = opts.useL1Timings;
  }

  getTimingVersion() {
    const version = this.getL2Timings()
      ? TimingVersions.L2
      : this.getL1Timings()
      ? TimingVersions.L1
      : TimingVersions.UNKNOWN;
    return version;
  }

  getL2Timings() {
    if (
      !!this.performance &&
      !!this.performance.getEntriesByType &&
      !!this.performance.getEntriesByType('navigation')
    ) {
      return this.performance.getEntriesByType('navigation')[0];
    }
  }

  getL1Timings() {
    return this.performance.timing;
  }

  diff() {
    // If we are using our fallback performance api (ie window.performance
    // doesn't  exist), don't return anything.
    if (this.performance.unreliable === true) {
      return undefined;
    }

    const diff = {};
    const l2Timings = this.getL2Timings();
    const l1Timings = this.getL1Timings();

    // Do a little clean up on the values.
    // - We expect that all values are integer values. Chrome can produce floats though...
    // - We should never see a negative value, but if we do, set the value to a magic number,
    //   so it's easy to spot in sentry.
    const sanitize = (value, magicNumber) => {
      value = parseInt(value);
      if (value < 0) {
        value = magicNumber;
      }
      return value;
    };

    const diffL1 = () => {
      // Make navigation timings relative to navigation start.
      for (const key in NAVIGATION_TIMING_FIELDS) {
        const timing = l1Timings[key];

        if (
          timing === 0 &&
          OPTIONAL_NAVIGATION_TIMING_FIELDS.indexOf(key) >= 0
        ) {
          // A time value of 0 for certain fields indicates a non-applicable value. Set to null.
          diff[key] = null;
        } else {
          // Compute the delta relative to navigation start. This removes any
          // ambiguity around what the 'start' or 'baseTime' time is. Since we
          // are sure the current set of navigation timings were created using
          // the same kind of clock, this seems like the safest way to do this.
          diff[key] = sanitize(
            timing - this.performance.timing.navigationStart,
            InvalidL1Val
          );
        }
      }
    };

    const diffL2 = () => {
      // If we have level 2 timings we can almost return the timings directly. We just have massage
      // a couple fields to keep it backwards compatible.
      for (const key in NAVIGATION_TIMING_FIELDS) {
        const mappedKey = L2TimingsMap[key] || key;
        diff[key] = sanitize(l2Timings[mappedKey], InvalidL2Val);
      }
    };

    // Case for testing. We should always try to use l2, but if explicitly requested use L1.
    if (this.useL1Timings && l1Timings) {
      diffL1();
    } else if (l2Timings) {
      diffL2();
    } else if (l1Timings) {
      diffL1();
    }

    return diff;
  }
}

export default new NavigationTiming();
