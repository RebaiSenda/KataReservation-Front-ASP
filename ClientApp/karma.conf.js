module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // laisse visible le résultat des tests Jasmine dans la fenêtre
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    // Utilisez Chrome normal pour le débogage
    browsers: ['ChromeCustom'],
    customLaunchers: {
      ChromeCustom: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-extensions',
          '--remote-debugging-port=9222',
          '--enable-logging' // Ajouté pour le logging
        ]
      }
    },

    // Paramètres de tolérance pour éviter les déconnexions
    captureTimeout: 300000, // Augmenté pour plus de stabilité
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 15000,
    browserNoActivityTimeout: 300000,
    processKillTimeout: 5000,

    // Options supplémentaires pour la stabilité
    failOnEmptyTestSuite: false,
    retryLimit: 0,

    singleRun: false,  // Changer à 'true' si vous exécutez dans un CI ou si vous voulez juste une exécution unique
    restartOnFileChange: true
  });
};