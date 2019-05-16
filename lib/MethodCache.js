import { Mongo } from 'meteor/mongo';

import DataLoader from 'dataloader';

import MethodTracer from './MethodTracer';
import {
  getMergedSelector,
  createMeteorAsyncFunction,
  buildSelector,
  shouldUseCache,
} from './helpers';

class MethodCache {
  constructor() {
    this.caches = {};
    this.stats = {};
  }

  disableCaching() {
    MethodTracer.setMethodInfo({ caching: false });
  }

  enableCaching() {
    MethodTracer.setMethodInfo({ caching: true });
  }

  isCacheEnabled(enableCaching) {
    const { caching = enableCaching } = MethodTracer.getMethodInfo() || {};
    return caching;
  }

  initCache(logStats) {
    const methodId = MethodTracer.getMethodId();

    const dataLoader = new DataLoader((mergedSelectors) => {
      if (logStats) {
        this.incrementFetchCount(methodId, mergedSelectors.length);
      }

      const { collectionName, selector, options } = buildSelector(mergedSelectors);
      const collection = Mongo.Collection.get(collectionName)._collection;
      return collection
        .rawCollection()
        .find(selector, options)
        .toArray();
    });

    this.caches[methodId] = dataLoader;

    return dataLoader;
  }

  getCache() {
    const methodId = MethodTracer.getMethodId();
    if (methodId) {
      const cache = this.caches[methodId];

      return cache;
    }
  }

  getCachedValue(cache, mergedSelector, logStats) {
    if (logStats) {
      const methodId = MethodTracer.getMethodId();
      this.incrementLoadCount(
        methodId,
        Array.isArray(mergedSelector) ? mergedSelector.length : 1,
      );
    }

    const syncPromise = createMeteorAsyncFunction((selector) => {
      if (Array.isArray(selector)) {
        return cache.loadMany(selector);
      }

      // Fetch always returns an array
      return cache.load(selector).then(result => [result]);
    });
    return syncPromise(mergedSelector);
  }

  clearCache(logStats) {
    const cache = this.getCache();

    const methodId = MethodTracer.getMethodId();
    if (cache) {
      if (logStats) {
        this.logStats(methodId);
      }

      cache.clearAll();
      delete this.caches[methodId];
    }
  }

  clearCacheValue(collectionName, selector) {
    const cache = this.getCache();
    cache.clear(getMergedSelector(collectionName, selector));
  }

  invalidateCache(collectionName, selector) {
    if (shouldUseCache(selector)) {
      const mergedSelector = getMergedSelector(collectionName, selector);
      const cache = this.getCache();

      if (typeof mergedSelector === 'string') {
        cache.clear(getMergedSelector(collectionName, selector));
      } else {
        mergedSelector.forEach(sel => cache.clear(sel));
      }
    } else {
      // If cache key can't be determined, clear entire cache as a safety measure
      // TODO: it would be great to be able to clear only the cache of one collection
      this.clearCache();
    }
  }

  initStats() {
    const methodId = MethodTracer.getMethodId();

    if (this.stats[methodId]) {
      return;
    }

    if (methodId) {
      this.stats[methodId] = { fetchCount: 0, loadCount: 0 };
    }
  }

  incrementFetchCount(methodId, inc) {
    methodId = methodId || MethodTracer.getMethodId();
    if (this.stats[methodId]) {
      this.stats[methodId].fetchCount += inc;
    }
  }

  incrementLoadCount(methodId, inc) {
    methodId = methodId || MethodTracer.getMethodId();
    if (this.stats[methodId]) {
      this.stats[methodId].loadCount += inc;
    }
  }

  logStats(methodId) {
    const { loadCount, fetchCount } = this.stats[methodId];
    console.log('Stats for method ', methodId);

    console.log('loadCount', loadCount);
    console.log('fetchCount', fetchCount);
    const cacheHit = loadCount === 0 ? 0 : (loadCount - fetchCount) / loadCount;
    console.log('cache hit', `${cacheHit * 100}%`);
    delete this.stats[methodId];
  }
}

export default new MethodCache();
