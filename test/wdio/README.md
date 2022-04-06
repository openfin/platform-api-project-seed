# Example for testing apps built on OpenFin platform with OpenFin WDIO Service


This example demonstrates how to test apps, based on OpenFin Platform, with [WDIO testrunner](http://webdriver.io/guide/testrunner/gettingstarted.html) and [WDIO OpenFin service](https://github.com/wenjunche/wdio-openfin-service.git).

## Run the example

1. host app.json of the Platform Seeed project on localhost:5555
2. run "npm run build"
3. run "npm run test"

## Guidelines for writing tests

Major version number of wdio-openfin-service needs to match Chromium version number of Runtime.  For an example, when testing with version 24.98.68.14 of Runtime,  version 98.x.x of wdio-openfin-service is required.

Because of [this issue](https://github.com/webdriverio/expect-webdriverio/issues/488) in [expect-wedriverio](https://github.com/webdriverio/expect-webdriverio), some async functions in expect-webdriverio are not declared with correct return types.  typescript may show warnings or errors for these functions.
