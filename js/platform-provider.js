fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async getSnapshot() {
                console.log('before getSnapshot')
                const snapshot = await super.getSnapshot();
                console.log('after getSnapshot')
                return snapshot;
            }

            async applySnapshot({ snapshot, options }) {
                console.log('before applySnapshot')
                const originalPromise = super.applySnapshot({ snapshot, options });
                console.log('after applySnapshot')

                return originalPromise;
            }
        };
        return new Override();
    },
    interopOverride: async (InteropBroker, provider, options, ...args) => {
        class Override extends InteropBroker {
            async joinContextGroup(channelName = 'default', target) {
                console.log('before super joinContextGroup')
                super.joinContextGroup(channelName, target);
                console.log('after super joinContextGroup')
            }
        }

        // options.systemChannels = [
        //     {
        //         id: 'green',
        //         displayMetadata: {
        //             color: '#00CC88',
        //             name: 'green'
        //         }
        //     },
        //     {
        //         id: 'purple',
        //         displayMetadata: {
        //             color: '#8C61FF',
        //             name: 'purple'
        //         }
        //     },
        //     {
        //         id: 'orange',
        //         displayMetadata: {
        //             color: '#FF8C4C',
        //             name: 'orange'
        //         }
        //     },
        //     {
        //         id: 'red',
        //         displayMetadata: {
        //             color: '#FF5E60',
        //             name: 'red'
        //         }
        //     },
        //     {
        //         id: 'pink',
        //         displayMetadata: {
        //             color: '#FF8FB8',
        //             name: 'pink'
        //         }
        //     },
        //     {
        //         id: 'yellow',
        //         displayMetadata: {
        //             color: '#E9FF8F',
        //             name: 'yellow'
        //         }
        //     }
        // ];
        return new Override(provider, options, ...args);
    }
});
    fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));