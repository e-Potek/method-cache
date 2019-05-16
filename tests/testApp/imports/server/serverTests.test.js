import { Meteor } from 'meteor/meteor';

import { expect } from 'chai';

const call = (name, ...params) =>
  new Promise((resolve, reject) => {
    Meteor.call(name, ...params, (err, result) =>
      (err ? reject(err) : resolve(result)));
  });

describe('Method cache tests - server', function () {
  this.slow(1);
  beforeEach((done) => {
    Meteor.call('reset', done);
  });

  describe('1000 todo fetches', () => {
    it('does not work with cached methods', async () => {
      await call('insert');
      const result = await call('isEqual', 1000);

      expect(result).to.equal(false);
    });

    it('works without caching', async () => {
      await call('insert');
      const result = await call('isEqualNoCache', 1000);

      expect(result).to.equal(false);
    });
  });
});
