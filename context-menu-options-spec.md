# Context Menu Options API Spec

This document describes the API spec for the initial release of OpenFin Core context menus.

## General approach

The general options API matches the existing popup menu options API as closely as possible.  The purpose of this is to *share implementation in the form of an abstract menu options API* to whatever degree is possible.

### Roles

Electron supports a number of built-in menu items that can be immediately leveraged via the menu API.  Some of these roles (e.g. `cut`, `copy`, `paste`) provide baseline functionality that matches existing default chromium behavior (this is fortuitous, since that's what we're using in the current implementation and so the transition should be seamless).  Others provide functionalities that we may wish to add in the future, but which are not immediate asks - these can be delayed for now, but introduced shortly after the migration as a low-cost, high-yield feature expansion.

The overall `Role` shape remains unchanged from the native Electron API, however the actual list of supported roles may differ.  Eventually, we may upstream our defined `role`s to Electron.  For now, the following `role`s are supported:

* `print`
* `navigateForward`
* `navigateBackward`

### Options/Configuration

The new `MenuOptions` have the following shape:

```typescript
type MenuOptions = {
  template: Array<MenuItemTemplate>;
}
```

The existing `ShowPopupMenuOptions` class has been renamed to `PopupMenuOptions` and changed to a derived type of the above class.

The new `ContextMenuOptions` have the following shape:

```typescript
export type ContextMenuOptions = {
    template: Array<PrebuiltContextMenuItems>;
    enabled?: boolean;
};

export type PrebuiltContextMenuItems =
    | 'separator'
    | 'cut'
    | 'copy'
    | 'paste'
    | 'spellCheck'
    | 'toggleDevTools'
    | 'reload'
    | 'navigateForward'
    | 'navigateBack'
    | 'print';
```

Eventually, we may expand this type to allow user-defined `ContextMenuItemTemplate`s by exposing the template shape used by this initial implementation (see: the default template below).

The `MenuItemTemplate` type has been expanded to include a `role` field that exposes (a selection of) electron's built-in menu item roles per the electron spec:

```typescript
type MenuItemTemplate = {
  // ...
  role?: 'cut' | 'copy' | 'paste' | 'toggleDevTools' | 'reload';;
}
```

### Location in manifest

The location of the options in the app settings/manifest is closely tied to the level of granularity we wish to support when allowing users to alter the settings at runtime and to differ context menu settings themselves between contexts within an application.

As can be seen above, the "flat" architecture itself allows for quite a bit of context-sensitive responsiveness through the flags present on the electron `context-menu` event - in light of this, it should not be necessary to support differential settings *for the purpose of discriminating between elements within a single page context*.  What remains is to support varying settings across pages that perform fundamentally different functions within a single application.

To achieve this, we will support adding the option at the top-level in the app manifest as a default behavior across all views/windows, and then individually again on view/window settings as an option to override the default.

## Backwards compatibility

The previous context menu option spec consists of two separate options. At the app manifest level:

```typescript
// Enables context menus for the entire application
contextMenu: boolean;
```

At the view/window level:

```typescript
// Configures the context menu that appears when the user right-clicks in a view.
contextMenuSettings: {
  // whether there's a context menu at all
  enable: boolean;
  // show 'inspect' item that opens devtools
  devTools: boolean;
  // reload the page
  reload: boolean;
};
```

The `contextMenuSettings` option is now deprecated.  If one is encountered (in the manifest or via a runtime options set call), it is parsed *by the context menu display handler* into an equivalent set of options in the new spec, which are then used to generate the context menu.

The app manifest-level option is also deprecated, and only works if users are using the old options spec (it was already a legacy feature being shimmed-in through the `contextMenuSettings` prop by `convert-options`).

### Default options

The default set of context menu options can be seen below:

```typescript
const defaultContextMenuOptions: ContextMenuOptions = {
    template: [
        'spellCheck',
        'cut',
        'copy',
        'paste',
        { type: 'separator', visible: { editFlags: ['canCut', 'canCopy', 'canPaste'] } },
        'toggleDevTools',
        'reload'
    ]
};
```

Note that the `ContextMenuOptions` type here is somewhat more-powerful than the one exposed in the user-facing spec.  This type will eventually be exposed.
