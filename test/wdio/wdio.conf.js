
exports.config = {
    port: 9515,
    path: '/',
    specs: [
        './test.js'
    ],

    capabilities: [{
        maxInstances: 1,
        browserName: 'openfin'
    }],

    reporters: ['spec'],
    logLevel: 'warn',
    coloredLogs: true,

    waitforTimeout: 10000,
    connectionRetryTimeout: 900000,
    connectionRetryCount: 1,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd'
    },

    services: [
        ['openfin', {
            logFileName: 'wdio-chromedriver.log',
            outputDir: '.',
            args: ['--verbose']
        }]
    ],
    openfin: {
        manifest: 'http://localhost:5555/app.json',
        debuggerPort: 9090
    }
}
