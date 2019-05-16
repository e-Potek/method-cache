import { initializeMethodCache } from 'meteor/epotek:method-cache';

import '../methods';

console.log('Starting cache methods');
initializeMethodCache({ logStats: true });

describe('Init', () => {
  before((done) => {
    Meteor.startup(done);
  });

  it('Has Initiated', () => {
    // Test code
  });
});
