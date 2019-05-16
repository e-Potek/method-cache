import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MethodCache } from 'meteor/epotek:method-cache';

const Todos = new Mongo.Collection('todos');

const checkTodos = async (times) => {
  const result1 = Todos.findOne({ _id: 'todoId' });
  await Todos.rawCollection().update({}, { title: 'yo2' });

  let isEqual = true;
  for (let index = 0; index < times; index++) {
    const result2 = Todos.findOne('todoId');
    isEqual = JSON.stringify(result1) === JSON.stringify(result2);
  }

  return isEqual;
};

Meteor.methods({
  async isEqual(times) {
    MethodCache.enableCaching();
    return checkTodos(times);
  },
  async isEqualNoCache(times) {
    return checkTodos(times);
  },
  reset() {
    Todos.remove({});
  },
  insert(todo = { _id: 'todoId', title: 'yo' }) {
    Todos.insert(todo);
  },
  update(selector, modifier) {
    Todos.update(selector, modifier);
  },
  async rawUpdate(selector, modifier) {
    return Todos.rawCollection().update(selector, modifier);
  },
  updateAndGet(selector, modifier, withCache) {
    if (withCache) {
      MethodCache.enableCaching();
    }

    // initiate cache
    const todos = Todos.find(selector).fetch();

    Todos.update(selector, modifier);

    return Todos.find(selector).fetch();
  },
  async updateAndGetMulti(withCache) {
    if (withCache) {
      MethodCache.enableCaching();
    }

    Todos.insert({ _id: 'id1' });
    Todos.insert({ _id: 'id2' });

    // initiate cache
    const todos = Todos.find({ _id: { $in: ['id1', 'id2'] } }).fetch();

    Todos.update('id1', { $set: { title: 'yo' } });
    await Todos.rawCollection().update(
      { _id: 'id2' },
      { $set: { title: 'yo' } },
    );

    return Todos.find({ _id: { $in: ['id1', 'id2'] } }).fetch();
  },
  nestedUpdateAndGetMulti(withCache) {
    if (withCache) {
      MethodCache.enableCaching();
    }

    return Meteor.call('updateAndGetMulti', false);
  },
});
