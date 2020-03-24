# Platform API Project Seed

This project seed includes the following [Platform API](https://openfin.co/platform-api) capabilites:

* Examples of the configuration required to use the Platform API and apply customizations
* Usage of the Platform API to group, tab, and rearrange application windows
* API examples of View management and creation
* API examples of Snapshot saving and applying
* Examples of visual customization via CSS
* Examples of visual customization by providing a custom Platform Window
* Examples of behavioral customization by overriding the Platform APIs


## How to use this repository:

* Clone this repository
* Install the dependencies: `npm install`
* To launch the default application: Start the live-server and launch the application: `npm start`
* To launch the main window application: Start the live-server and launch the application: `npm run mainwindow`

## Understanding the code

### Platform configuration
* [Platform configuration](https://developers.openfin.co/docs/platform-api#section-1-launching-a-platform) has been included in the provided [app.json](app.json) file.
* The [defaultWindowOptions](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) key in the provided `app.json` will instruct the platform to replace our Standard Window with the provided [platform-window.html](platform-window.html) file.
* The [commands](https://developers.openfin.co/docs/platform-api#section-5-3-using-keyboard-commands) key in the provided `app.json` will allow keyboard access to the next tab command.
* The [providerUrl]() key in the provided `app.json` will allow you to make custom changes to the Platform APIs, by pointing to a hosted [provider.html](provider.html) file. (STARTING IN v15.80.50.x)

### CSS Customization
* A [stylesheet](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) is linked in the [platform-window.html](platform-window.html) file, and allows for [visual customization](styles/frame-styles.css). For a complete view of all properties, please refer to the [example stylesheet](https://github.com/openfin/layouts-v2-style-examples)

### Platform Window
The [platform-window.html](platform-window.html) file contains the [layout-container](https://developers.openfin.co/docs/platform-api#section-5-2-complete-window-customization) element and two custom elements: `left-menu` and `title-bar`. These elements, in conjunction with the [js/left-menu.js](js/left-menu.js) and [js/title-bar.js](js/title-bar.js) files, enable the following functionality:

##### left-menu
Provides examples of the following functionality:
* Adding a View to an existing Window
* Adding a View in a new Window
* Saving the Window's current Layout
* Restoring the Window's current Layout
* Creating a regular OpenFin Window
* Saving/Restoring Platform Snapshots
* Applying a preset arrangement on the current window (Grid, Tabs, Rows, Columns)

##### title-bar
Provides examples of the following functionality:
* Draggable area
* Close/Maximize/Minimize buttons

### Provider
Our [custom Provider](js/platform-provider.js) includes an [extension](js/external-window-snapshot.js) that will look for a pre-configured list of [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) (the default being the provided [my_platform_notes.txt](my_platform_notes.txt) file opened in notepad.exe) and:

* Override `getSnapshot` to include a [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) section containing information on any any external window included in the configuration.
* Override `applySnapshot` to look for an [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) section and restore the position and state of any external window included in the configuration.

## Understanding the code - Main Window Example

### Platform configuration
* [Platform configuration](https://developers.openfin.co/docs/platform-api#section-1-launching-a-platform) has been included in the provided [app-window-main.json](app-window-main.json) file. This config does not include a default window as this is managed by the custom provider: [provider-window-main.html](provider-window-main.html)
* The [defaultWindowOptions](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) key in the provided `app-window-main.json` will instruct the platform to replace our Standard Window with the provided [platform-window-common.html](platform-window-common.html) file for new windows.
* The [commands](https://developers.openfin.co/docs/platform-api#section-5-3-using-keyboard-commands) key in the provided `app-window-main.json` will allow keyboard access to the next tab command.
* The [providerUrl]() key in the provided `app-window-main.json` will allow you to make custom changes to the Platform APIs, by pointing to a hosted [provider-window-main.html](provider-window-main.html) file. (STARTING IN v15.80.50.x)

### CSS Customization
* A [stylesheet](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) is linked in the [platform-window-common.html](platform-window-common.html) file, and allows for [visual customization](styles/frame-styles.css). For a complete view of all properties, please refer to the [example stylesheet](https://github.com/openfin/layouts-v2-style-examples)
* A [stylesheet](https://developers.openfin.co/docs/platform-api#section-standard-window-customization) is linked in the [platform-window-main.html](platform-window-main.html) file, and allows for [main window visual customization](styles/frame-styles-window-main.css) with some additional classes that only apply to the main window. For a complete view of all properties, please refer to the [example stylesheet](https://github.com/openfin/layouts-v2-style-examples)

### Platform Window Common
The [platform-window-common.html](platform-window-common.html) file contains the [layout-container](https://developers.openfin.co/docs/platform-api#section-5-2-complete-window-customization) element and one custom element: `title-bar-save-restore`. This element, in conjunction with the [js/title-bar-save-restore.js](js/title-bar-save-restore.js) file, enable the following functionality:

##### title-bar-save-restore
Provides examples of the following functionality:
* Draggable area
* Close/Maximize/Minimize buttons
* Lets you save the layout of the current window (session storage for the lifetime of the window)
* Lets you restore the saved layout to the current window (so you could add/remove views to this window by dragging them in/out and then restore to a previous layout)

### Platform Window Main
The [platform-window-main.html](platform-window-main.html) file contains the [layout-container](https://developers.openfin.co/docs/platform-api#section-5-2-complete-window-customization) element and two custom elements: `left-menu` and `title-bar-main`. These elements, in conjunction with the [js/left-menu.js](js/left-menu.js) and [js/title-bar-main.js](js/title-bar-main.js) files, enable the following functionality:

##### left-menu
Provides examples of the following functionality:
* Adding a View to an existing Window
* Adding a View in a new Window
* Saving the Window's current Layout
* Restoring the Window's current Layout
* Creating a regular OpenFin Window
* Saving/Restoring Platform Snapshots
* Applying a preset arrangement on the current window (Grid, Tabs, Rows, Columns)

##### title-bar-main
Provides examples of the following functionality:
* Draggable area
* Close/Maximize/Minimize buttons
* When you close the window it saves a snapshot of the layout for all windows before closing the whole application.
* If the window is being closed because you have dragged the last view out of the main window into another window it adds a default view and doesn't close the window. If you want to have layout support in the main window then you must have at least one default view that you always want displayed or you have a main window without layout support.
* If only one view remains in the main window then it removes the close icon via the custom class in the [main window visual customization](styles/frame-styles-window-main.css) stylesheet and removes it when more than one view exists.


### Provider
Our [custom Provider](js/platform-provider.js) includes an [extension](js/external-window-snapshot.js) that will look for a pre-configured list of [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) (the default being the provided [my_platform_notes.txt](my_platform_notes.txt) file opened in notepad.exe) and:

* Override `getSnapshot` to include a [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) section containing information on any any external window included in the configuration.
* Override `applySnapshot` to look for an [externalWindows](https://cdn.openfin.co/docs/javascript/15.80.49.21/ExternalWindow.html) section and restore the position and state of any external window included in the configuration.

We also include an additional script [custom Provider Window Main](js/platform-provider-window-main.js) that:

* Checks for the last saved snapshot
* If retrieved, clears it and uses the local copy to launch the last saved set of windows
* If there is no snapshot it uses a default snapshot

