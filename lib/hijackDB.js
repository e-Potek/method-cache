import { MeteorX } from 'meteor/lamhieu:meteorx';
import { MongoInternals } from 'meteor/mongo';

import MethodCache from './MethodCache';
import wrapSession from './wrapSession';
import { getMergedSelector, shouldUseCache, optimizedApply } from './helpers';

// This hijack is important to make sure, collections created before
// we hijack dbOps, even gets tracked.
//  Meteor does not simply expose MongoConnection object to the client
//  It picks methods which are necessory and make a binded object and
//  assigned to the Mongo.Collection
//  so, even we updated prototype, we can't track those collections
//  but, this will fix it.
const originalOpen = MongoInternals.RemoteCollectionDriver.prototype.open;
MongoInternals.RemoteCollectionDriver.prototype.open = function open(name) {
  const self = this;
  const ret = originalOpen.call(self, name);

  Object.keys(ret).forEach((m) => {
    // make sure, it's in the actual mongo connection object
    // meteorhacks:mongo-collection-utils package add some arbitary methods
    // which does not exist in the mongo connection
    if (self.mongo[m]) {
      ret[m] = function (...args) {
        Array.prototype.unshift.call(args, name);
        return optimizedApply(self.mongo, self.mongo[m], args);
      };
    }
  });

  return ret;
};

// https://github.com/meteorhacks/kadira/blob/master/lib/hijack/db.js
const hijackFetch = ({ enableCaching, logStats }) => {
  const cursorProto = MeteorX.MongoCursor.prototype;
  const originalFetch = cursorProto.fetch;

  cursorProto.fetch = function fetch(...args) {
    const { collectionName, selector, options } = this._cursorDescription;
    const isCacheEnabled = MethodCache.isCacheEnabled(enableCaching);
    let result;

    if (isCacheEnabled && logStats) {
      MethodCache.initStats();
    }

    if (isCacheEnabled && shouldUseCache(selector, options)) {
      let cache = MethodCache.getCache();

      if (!cache) {
        cache = MethodCache.initCache(logStats);
      }

      result = MethodCache.getCachedValue(
        cache,
        getMergedSelector(collectionName, selector, options),
        logStats,
      );
    }

    if (!result) {
      result = originalFetch.apply(this, args);

      if (logStats) {
        MethodCache.incrementFetchCount(null, result.length);
      }
    }

    if (logStats) {
      MethodCache.incrementLoadCount(null, result.length);
    }

    return result;
  };
};

const hijackUpdate = ({ enableCaching }) => {
  const mongoConnectionProto = MeteorX.MongoConnection.prototype;
  const originalUpdate = mongoConnectionProto.update;

  mongoConnectionProto.update = function update(...args) {
    const [collectionName, selector, mod, options] = args;
    const isCacheEnabled = MethodCache.isCacheEnabled(enableCaching);

    if (isCacheEnabled) {
      MethodCache.invalidateCache(collectionName, selector);
    }
    return originalUpdate.apply(this, args);
  };
};

const initializeMethodCache = ({
  enableCaching = false,
  log = true,
  logStats = false,
} = {}) => {
  const defaultOptions = {
    enableCaching,
    log,
    logStats,
  };

  MeteorX.onReady(() => {
    wrapSession(defaultOptions);
    hijackFetch(defaultOptions);
    hijackUpdate(defaultOptions);
    if (log) {
      console.log('Method caching is Ready!');
    }
  });
};

export default initializeMethodCache;
