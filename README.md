Platform API Project seed

This project seed includes the following Platform API capabilites:

* Configuration required to use the Platform API
* Use of the Platforms API to group, tab, and rearrange application windows
* API examples of creating and managing Views, saving and appliying snapshots
* Customizations

## How to use this repository: ##

* Clone this repository
* Install the dependencies: `npm install`
* Start the live-server and launch the application: `npm start`

## Understanding the code

* [Platform configuration](https://developers.openfin.co/docs/platform-api#section-1-launching-a-platform) has been included in the provided [app.json](app.json) file.
* [view-form.js](js/view-form.js) file Includes code examples for:
..* Create new Windows with pre configured Layotus
..* Add Views to existing Widnows
..* Saving and restoring of Platform Snapshots

## Config Generator

Co-hosted with this project is the [config generator](https://openfin.github.io/golden-prototype/config-gen), this provides an easy WYSIWYG interface to create [Platform configuration files](https://developers.openfin.co/docs/platform-api#section-1-launching-a-platform)

## Customizations

For ease of use, all customization related information is in the [customization Readme](customization/Readme.md)
