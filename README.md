# Meteor method cache

Use graphql's DataLoader library to speed up your heavy methods.

*Warning: Probably don't use this in production, you will get errors with complex requests*


## Usage

Install the package in your meteor app:

```sh
meteor add epotek:method-cache
```

Start caching by initializing it on your server:

```js
import { initializeMethodCache } from 'meteor/epotek:method-cache';

initializeMethodCache(options);
```

Enable caching in any of your methods:

```js
import { MethodCache } from 'meteor/epotek:method-cache';

Meteor.methods({
    heavyMethod() {
        MethodCache.enableCaching();

        const todos = Todos.find({ userId: this.userId }).fetch();

        const allowedTodos = todos.filter(({ listId, ...todo }) => {
            // Each identical todo list will be fetched once
            const permissions = TodoLists.findOne({ _id: listId });
            // Will only be fetched once
            const user = Users.findOne({ _id: this.userId });

            return isAllowedToSeeTodos(permissions, user, todo);
        });

        return allowedTodos;
    }
})
```

### Options

You can pass the following options to `initializeMethodCache`:

| Param           | Type    | Default value | Description                                       |
| --------------- | ------- | ------------- | ------------------------------------------------- |
| `enableCaching` | Boolean | `false`       | Enables caching on all methods by default         |
| `log`           | Boolean | `true`        | Enables the initial logging on startup of caching |
| `logStats`      | Boolean | `false`       | Logs cache hit ratios for all your methods        |


### `MethodCache`

This package exports the `MethodCache` class, which can be used to enable or disable caching in your methods:

* `MethodCache.enableCaching()`: Enables caching on this method, if `options.enableCaching` is set to `false`
* `MethodCache.disableCaching()`: Disables caching on this method, if `options.enableCaching` is set to `true`
* `MethodCache.clearCache()`: Can be run anywhere inside a method, clears the entire cache


## What it does (and what it doesn't)

The cacher works by caching any `fetch` that only targets pure `_id`s. Meaning any selector that uses more than an `_id` will not be cached. It's meant to work for these selectors: `{ _id: 'someDocId' }` and `{ _id: { $in: ['someDocId', 'someOtherDocId'] } }`.
This is a limitation that can be adressed in the future.

The cacher adds a little bit of overhead, so if you're only ever fetching one or two duplicate documents in your method, it might be a bit slower.

The cacher currently only works for methods initiated by a client. Server-side initiated methods are not cached for the moment.

If you specify any `fields` in your selector, multiple caches will be created based on the `fields`.

When you update a document, the cacher will try to identify which document it has to clear from the cache. It works if your update selector targets `_id`s only, just as the caching strategy does. If you use a more complex selector, it will fall back to clearing the entire cache (across collections). If you've used `fields` in your queries, they will not be invalidated.

## Performance example

You can run the tests with `meteor npm t` in this repo to run some examples on your machine, but here's what it can do:

Fetch 1000 identical documents repeatedly (1-field documents) on a local machine (i.e. super fast DB) results in the following stats:

* Without caching: **~350ms**
* With caching: **~40ms**

Which is an almost **10x** increase in performance
