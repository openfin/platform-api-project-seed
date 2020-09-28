//fin.me.showDeveloperTools();

(async function() {
    await fin.Platform.init();

    const snapshotItem = 'snapShot';
    const defaultSnapshotUrl = 'http://localhost:5555/default-snapshot.json';

    const platform = fin.Platform.getCurrentSync();
    const storedSnapshotValue = window.localStorage.getItem(snapshotItem);
    const storedSnapshot = storedSnapshotValue && JSON.parse(storedSnapshotValue);

    if(storedSnapshot) {
        console.log('applying stored snapshot', storedSnapshot);
        return platform.applySnapshot(storedSnapshot);
    } else {
        const defaultSnapshotReq = await window.fetch(defaultSnapshotUrl);
        const defaultSnapshot = await defaultSnapshotReq.json();

        console.log('applying default snapshot', defaultSnapshot);
        return platform.applySnapshot(defaultSnapshot.snapshot);
    }
})();
