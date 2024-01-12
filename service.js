const path = require('path');

// optional

const Cabin = require('cabin');

// required
const Bree = require('bree');

//
// NOTE: see the "Instance Options" section below in this README
// for the complete list of options and their defaults
//
const bree = new Bree({
  //
  // NOTE: by default the `logger` is set to `console`
  // however we recommend you to use CabinJS as it
  // will automatically add application and worker metadata
  // to your log output, and also masks sensitive data for you
  // <https://cabinjs.com>
  //
  // NOTE: You can also pass `false` as `logger: false` to disable logging
  //
  logger: new Cabin(),

  //
  // NOTE: instead of passing this Array as an option
  // you can create a `./jobs/index.js` file, exporting
  // this exact same array as `module.exports = [ ... ]`
  // doing so will allow you to keep your job configuration and the jobs
  // themselves all in the same folder and very organized
  //
  // See the "Job Options" section below in this README
  // for the complete list of job options and configurations
  //
  jobs: [

    // runs `./jobs/some-other-path.js` on start cron: ' 0 0/4 * * ?',
    {
      name: 'MultipleTargetSyncFetchStock',
      path: path.join(__dirname, 'jobs', 'MultipleTargetSyncFetchStock.js'),
      cron: '0 58 16 ? * *',
      cronValidate: {
        override: {
          useSeconds: true,
          useBlankDay: true,
        },
      },
    },
    // {
    //   name: 'MultipleTargetSyncFetchStock1',
    //   path: path.join(__dirname, 'jobs', 'MultipleTargetSyncFetchStock.js'),
    //   cron: '30 52 16 ? * *',
    //   cronValidate: {
    //     override: {
    //       useBlankDay: true,
    //       useSeconds: true,
    //     },
    //   },
    // },
    // {
    //   name: 'MultipleTargetSyncFetchCrypt',
    //   path: path.join(__dirname, 'jobs', 'MultipleTargetSyncFetchCrypt.js'),
    //   cron: '0 49 16 ? * *',
    //   cronValidate: {
    //     override: {
    //       useBlankDay: true,
    //       useSeconds: true,
    //     },
    //   },
    // },

  ],
});

(async () => {
   await bree.start();
  //await bree.start('MultipleTargetSyncFetchStock1');
  //await bree.start('MultipleTargetSyncFetchCrypt');
})();
