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
    this.caches = [];
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

  initCache() {
    const methodId = MethodTracer.getMethodId();

    const dataLoader = new DataLoader((mergedSelectors) => {
      const { collectionName, selector } = buildSelector(mergedSelectors);
      const collection = Mongo.Collection.get(collectionName)._collection;
      return collection
        .rawCollection()
        .find(selector)
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

  getCachedValue(cache, mergedSelector) {
    const syncPromise = createMeteorAsyncFunction((selector) => {
      if (Array.isArray(selector)) {
        return cache.loadMany(selector);
      }

      // Fetch always returns an array
      return cache.load(selector).then(result => [result]);
    });
    return syncPromise(mergedSelector);
  }

  clearCache() {
    const cache = this.getCache();
    const methodId = MethodTracer.getMethodId();
    if (cache) {
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
}

export default new MethodCache();
