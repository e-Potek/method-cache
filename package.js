Package.describe({
  summary: 'Meteor method cache',
  version: '0.1.1',
  git: 'https://github.com/e-Potek/method-cache',
  name: 'epotek:method-cache',
});

const configurePackage = (api) => {
  api.versionsFrom('1.8.1');
  api.mainModule('lib/index.js', 'server');
  api.use([
    'ecmascript',
    'lamhieu:meteorx@2.1.1',
    'dburles:mongo-collection-instances@0.3.5',
  ]);
};

Package.on_use((api) => {
  configurePackage(api);
});

Package.onTest((api) => {
  configurePackage(api);
});

Npm.depends({
  dataloader: '1.4.0',
});
