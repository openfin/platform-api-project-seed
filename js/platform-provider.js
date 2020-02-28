fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async getSnapshot() {
                const snapshot = await super.getSnapshot();
                //we add host specs to the snapshot.
                return {
                    ...snapshot,
                    hostSpecs: await fin.System.getHostSpecs()
                };
            }

            async applySnapshot({ snapshot, options }) {
                //Do not apply snapshots if we have 3 or more windows.
                const wins = await fin.Application.getCurrentSync().getChildWindows();
                if (wins.length >= 3) {
                    //no more windows for you.
                    throw new Error('Max number of windows reached');
                }
                return super.applySnapshot({ snapshot, options });
            }
        };
        return new Override();
    }
});