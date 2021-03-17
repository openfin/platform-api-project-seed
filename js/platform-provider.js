//fin.me.showDeveloperTools();

(async function () {
    await fin.Platform.init();
    const button = document.querySelector('#button');

    button.addEventListener('click', async (event) => {
        event.preventDefault();
        const snapshotItem = 'snapShot';
        const defaultSnapshotUrl = 'http://localhost:5555/default-snapshot.json';

        const platform = fin.Platform.getCurrentSync();
        const storedSnapshotValue = window.localStorage.getItem(snapshotItem);
        const storedSnapshot = storedSnapshotValue && JSON.parse(storedSnapshotValue);

        if (storedSnapshot) {
            fin.me.blur();
            fin.me.hide();
            console.log('applying stored snapshot', storedSnapshot);
            // return platform.applySnapshot({ windows: storedSnapshot.windows });
            return platform.applySnapshot(storedSnapshot);
        } else {
            const defaultSnapshotReq = await window.fetch(defaultSnapshotUrl);
            const defaultSnapshot = await defaultSnapshotReq.json();

            fin.me.blur();
            fin.me.hide();
            console.log('applying default snapshot', defaultSnapshot);
            return platform.applySnapshot(defaultSnapshot.snapshot);
        }
    });


})();
