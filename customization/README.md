Platform API Customization technical demo

Technical demonstration of OpenFin's Platform API capabilites. This technical demo highlights:

* Configuration required to use the Platform API and apply customizations
* Use of the Platforms API to group, tab, and rearrange application windows
* API examples of creating and managing Views, saving and appliying snapshots
* Examples of visual customizations via CSS
* Examples of visual customization by providing a custom Platform Window
* Examples of behavioural customization by overriding the Platform APIs


## How to use this repository: ##
Important, the npm start command needs an extra parameter to start the customization project.

* Clone this repository
* Install the dependencies: `npm install`
* Start the live-server and launch the application: `npm start -- --custom`

## Understanding the code

### Platform configuration
* [Platform configuration](https://developers.openfin.co/docs/platform-api#section-1-launching-a-platform) have been included in the provided [app.json](app.json) file.
* A [defaultWindowOptions](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) key has been added and will replace our Standard Window with the provided [platform-window.html](platform-window.html) file.
* A [commands](https://developers.openfin.co/docs/platform-api#section-5-3-using-keyboard-commands) key has been added and will provide keyboard access to the next tab command.
* A [providerUrl]() key has been added and will allow Changes to the Platform APIs (STARTING IN v15.80.50.x), the [provider.html](provider.html) file provided will make minor changes to the Platform API


### CSS Customization
* A [stylesheet](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) is linked in the [platform-window.html](platform-window.html) file that provides some [visual customizations](styles/frame-styles.css) for a complete view of all properties please refer to the [example stylesheet](https://github.com/openfin/layouts-v2-style-examples)

### Platform Window
The [js/platform-window.js](platform-window.html) file is composed of the [layout-container](https://developers.openfin.co/docs/platform-api#section-5-2-complete-window-customization) element and two custom elements (`left-menu`, `title-bar`):

##### left-menu
Provides the examples of the following functionality:
* Adding a View to an existing window
* Adding a View in a new Window
* Creating a regular OpenFin Window
* Saving/Restoring Platform Snapshots
* Appliying a preset arrangement on the current window (Grid, Tabs, Rows)

##### title-bar
Provides the examples of the following functionality:
* Dragable area
* Close/Maximise/Minimize buttons

### Provider
The [provider.html](provider.html) file provided will change the Platform API in the following ways:
* Override getSnapshot to include [hostSpecs](https://cdn.openfin.co/docs/javascript/15.80.49.21/tutorial-System.getHostSpecs.html)
* Override applySnapshot to reject if 3 or more Windows have been created.
