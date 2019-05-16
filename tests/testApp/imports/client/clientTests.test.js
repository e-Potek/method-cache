import { Meteor } from 'meteor/meteor';

import { expect } from 'chai';

const call = (name, ...params) =>
  new Promise((resolve, reject) => {
    Meteor.call(name, ...params, (err, result) =>
      (err ? reject(err) : resolve(result)));
  });

describe('Method cache tests- client', function () {
  this.slow(1);
  beforeEach((done) => {
    Meteor.call('reset', done);
  });

  describe('1000 todo fetches', () => {
    it('works with cached methods', async () => {
      await call('insert');
      const result = await call('isEqual', 1000);

      expect(result).to.equal(true);
    });

    it('works without caching', async () => {
      await call('insert');
      const result = await call('isEqualNoCache', 1000);

      expect(result).to.equal(false);
    });
  });

  describe('cache clearing', () => {
    it('works without cache', async () => {
      await call('insert', { _id: 'id1' });
      const todos = await call(
        'updateAndGet',
        { _id: 'id1' },
        { $set: { title: 'yo' } },
      );
      expect(todos[0]).to.deep.equal({ _id: 'id1', title: 'yo' });
    });

    it('works with cache', async () => {
      await call('insert', { _id: 'id1' });
      const todos = await call(
        'updateAndGet',
        { _id: 'id1' },
        { $set: { title: 'yo' } },
        true,
      );
      expect(todos[0]).to.deep.equal({ _id: 'id1', title: 'yo' });
    });

    it('works with multiple documents', async () => {
      const todos = await call('updateAndGetMulti', true);

      expect(todos).to.deep.equal([
        { _id: 'id1', title: 'yo' },
        { _id: 'id2' },
      ]);
    });

    it('works with multiple documents without cache', async () => {
      const todos = await call('updateAndGetMulti', false);

      expect(todos).to.deep.equal([
        { _id: 'id1', title: 'yo' },
        { _id: 'id2', title: 'yo' },
      ]);
    });

    it('caches methods called within methods', async () => {
      const todos = await call('nestedUpdateAndGetMulti', true);

      expect(todos).to.deep.equal([
        { _id: 'id1', title: 'yo' },
        { _id: 'id2' },
      ]);
    });

    it('does not cache nested methods', async () => {
      const todos = await call('updateAndGetMulti', false);

      expect(todos).to.deep.equal([
        { _id: 'id1', title: 'yo' },
        { _id: 'id2', title: 'yo' },
      ]);
    });
  });
});
