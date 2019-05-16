Package.describe({
  summary: 'Meteor method cache',
  version: '0.1.0',
  //   git: 'https://github.com/meteorhacks/kadira.git',
  name: 'epotek:method-cache',
});

const configurePackage = (api) => {
  api.mainModule('lib/index.js', 'server');
  api.use([
    'ecmascript',
    'lamhieu:meteorx',
    'dburles:mongo-collection-instances',
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
