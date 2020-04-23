let _wrappedLayout;

function getWrappedLayout() {
    if(_wrappedLayout !== undefined) {
        return _wrappedLayout;
    }

    _wrappedLayout = fin.Platform.Layout.getCurrentSync();
    return _wrappedLayout;
}

export async function toggleLockedLayout() {

    let wrappedLayout = getWrappedLayout();
    const currentLayout = await wrappedLayout.getConfig();
    isLocked = await isLayoutLocked(oldLayout);

    if(isLocked){
        await unlockLayout(currentLayout);
    } else {
        await lockLayout(currentLayout);
    }
}

export async function isLayoutLocked(layoutConfig) {
    let layout;

    if(layoutConfig === undefined || layoutConfig.settings === undefined) {
        let wrappedLayout = getWrappedLayout();
        layout = await wrappedLayout.getConfig();
    }

    if(layout === undefined || layout.settings=== undefined) {
        return false;
    }

    return layout.settings.hasHeaders === false && layout.settings.reorderEnabled === false;
}

export async function lockLayout(layoutConfig) {
    let settings;
    let currentLayout;
    let wrappedLayout = getWrappedLayout();

    if(layoutConfig === undefined) {
        currentLayout = await wrappedLayout.getConfig();
    } else {
        currentLayout = layoutConfig;
    }

    settings = currentLayout.settings;

    wrappedLayout.replace({
        ...currentLayout,
        settings: {
            ...settings,
            hasHeaders: false,
            reorderEnabled: false,
        }
    });
}

export async function unlockLayout(layoutConfig) {
    let settings;
    let oldLayout;
    let dimensions;
    let wrappedLayout = getWrappedLayout();

    if(layoutConfig === undefined) {
        oldLayout = await wrappedLayout.getConfig();
    } else {
        oldLayout = layoutConfig;
    }

    settings = oldLayout.settings;
    dimensions = oldLayout.dimensions;

    wrappedLayout.replace({
        ...oldLayout,
        settings: {
            ...settings,
            hasHeaders: true,
            reorderEnabled: true,
        },
        dimensions: {
            ...dimensions,
            headerHeight: 20
        }
    });
}
