import { generateExternalWindowSnapshot, restoreExternalWindowPositionAndState } from './external-window-snapshot.js';

//We have customized our platform provider to keep track of a specific notepad window.
//Look for the "my_platform_notes.txt" file and launch it in notepad or add another external window to this array
const externalWindowsToTrack = [
    {
        name: 'Notepad',
        // Note that this is only the beginning of the title.
        // In `getExternalWindowByNameTitle`, we will just check that the title starts with this string.
        // This is in order to work with both 'my_platform_notes' and 'my_platform_notes.txt', depending on
        // the user's settings for viewing file extensions.
        title: 'my_platform_notes'
    }
];

fin.Platform.init({
    overrideCallback: async (Provider) => {
        class Override extends Provider {
            async getSnapshot() {
                const snapshot = await super.getSnapshot();

                //we add an externalWindows section to our snapshot
                const externalWindows = await generateExternalWindowSnapshot(externalWindowsToTrack);
                return {
                    ...snapshot,
                    externalWindows
                };
            }

            async applySnapshot({ snapshot, options }) {

                const originalPromise = super.applySnapshot({ snapshot, options });

                //if we have a section with external windows we will use it.
                if (snapshot.externalWindows) {
                    await Promise.all(snapshot.externalWindows.map(async (i) => await restoreExternalWindowPositionAndState(i)));
                }

                return originalPromise;
            }
        };
        return new Override();
    }
});

(async () => {

    fin.me.showDeveloperTools().then(() => console.log('Showing dev tools')).catch(err => console.error(err));

    const INTENT_DEFAULTS = [
        ["StartCall", [
            'fdc3.contact',
            'fdc3.contactList'
        ]],
        ["StartChat", [
            'fdc3.contact',
            'fdc3.contactList'
        ]],
        ["ViewChart", [
            'fdc3.instrument',
            'fdc3.instrumentList',
            'fdc3.portfolio',
            'fdc3.position'
        ]],
        ["ViewContact", [
            'fdc3.contact'
        ]],
        ["ViewQuote", [
            'fdc3.instrument'
        ]],
        ["ViewNews", [
            'fdc3.country',
            'fdc3.instrument',
            'fdc3.instrumentList',
            'fdc3.organization',
            'fdc3.portfolio'
        ]],
        ["ViewAnalysis", [
            'fdc3.instrument',
            'fdc3.organization',
            'fdc3.portfolio'
        ]],
        ["ViewInstrument", [
            'fdc3.instrument'
        ]],
    ]

    const CONTEXT_DEFAULTS = [
        ['fdc3.contact', []],
        ['fdc3.contactList', []],
        ['fdc3.instrument', []],
        ['fdc3.instrumentList', []],
        ['fdc3.organization', []],
        ['fdc3.country', []],
        ['fdc3.position', []],
        ['fdc3.portfolio', []]
    ]

    window.intentMap = new Map();
    window.contextMap = new Map(CONTEXT_DEFAULTS);
    window.colorMap = new Map();
    window.colorContextMap = new Map([
        ['red', new Map()],
        ['blue', new Map()],
        ['green', new Map()],
        ['default', new Map()]
    ]);


    for (let idx1 = 0; idx1 < INTENT_DEFAULTS.length; idx1++) {
        const intentPair = INTENT_DEFAULTS[idx1];
        const intentString = intentPair[0];
        const contextStringArray = intentPair[1];
        intentMap.set(intentString, new Map());
        const intentContexts = intentMap.get(intentString);
        for (let idx2 = 0; idx2 < contextStringArray.length; idx2++) {
            const contextString = contextStringArray[idx2];
            intentContexts.set(contextString, [])
        }   
    }


    function addEntityToIntentMap(clientIdentity, intentDeclaration) {
        validateIntentDeclaration(clientIdentity, intentDeclaration)

        const clientDeclaredIntents = Object.entries(intentDeclaration);
        for (const [intentString, contextStringArray] of clientDeclaredIntents) {
            const intentContexts = intentMap.get(intentString);

            for (let index = 0; index < contextStringArray.length; index++) {
                const contextString = contextStringArray[index];
                const intentContextArray = intentContexts.get(contextString);
                intentContextArray.push(clientIdentity)
            }
        }
    }

    function addEntityToContextMap(clientIdentity, contextDeclaration) {
        validateContextDeclaration(clientIdentity, contextDeclaration)

        for (let index = 0; index < contextDeclaration.length; index++) {
            const contextString = contextDeclaration[index];
            const clientArray = contextMap.get(contextString);
            clientArray.push(clientIdentity)
        }

        window.colorMap.set(clientIdentity.name, 'default')
    }

    function validateIntentDeclaration(clientIdentity, intentDeclaration) {
        const clientDeclaredIntents = Object.entries(intentDeclaration);
        for (const [intentString, contextStringArray] of clientDeclaredIntents) {
            const validContexts = intentMap.get(intentString)
            console.log(validContexts);
            if (validContexts === undefined) {
                throw new Error(`Declared intent "${intentString}" is not a valid FDC3 intent. Rejecting connection from ${JSON.stringify(clientIdentity)}.`)
            }

            for (let index = 0; index < contextStringArray.length; index++) {
                const contextString = contextStringArray[index];
                if (validContexts.get(contextString) === undefined) {
                    throw new Error(`Declared context "${contextString}" for "${intentString}" is not a valid FDC3 context for that intent. Rejecting connection from ${JSON.stringify(clientIdentity)}.`)
                }
            }
        }
    }

    function validateContextDeclaration(clientIdentity, contextDeclaration) {
        for (let index = 0; index < contextDeclaration.length; index++) {
            const contextString = contextDeclaration[index];

            if (contextMap.get(contextString) === undefined) {
                throw new Error(`Declared context "${contextString}" is not a valid FDC3 context. Rejecting connection from ${JSON.stringify(clientIdentity)}.`)
            }
        }
    }
    // entity creates a channel and becomes the channelProvider
    const interopBus = await fin.InterApplicationBus.Channel.create('InteropBroker');

    interopBus.onConnection((identity, payload) => {
        // can reject a connection here by throwing an error
        console.log('Client connection request identity: ', JSON.stringify(identity));
        console.log('Client connection request payload: ', JSON.stringify(payload));
        console.log('Client connection request payload: ', payload);
        if (payload.intentDeclaration) {
            addEntityToIntentMap(identity, payload.intentDeclaration);
        }
        if (payload.contextDeclaration) {
            addEntityToContextMap(identity, payload.contextDeclaration);
        }
        if (payload.colorChannelDeclaration) {
            window.colorMap.set(identity.name, payload.colorChannelDeclaration);
        }
    });

    interopBus.onDisconnection((identity, payload) => {
        // can reject a connection here by throwing an error
        console.log('Client connection request identity: ', JSON.stringify(identity));
        console.log('Client connection request payload: ', JSON.stringify(payload));
        console.log('Client connection request payload: ', payload);
    });

    interopBus.register('raiseIntent', (payload, identity) => {
        // register a callback for a 'topic' to which clients can dispatch an action
        console.log('Action dispatched by client: ', JSON.stringify(identity));
        console.log('Payload sent in dispatch: ', JSON.stringify(payload));
        return {
            echo: payload
        };
    });

    interopBus.register('broadcastContext', (payload, identity) => {
        // register a callback for a 'topic' to which clients can dispatch an action
        console.log('Action dispatched by client: ', JSON.stringify(identity));
        console.log('Payload sent in dispatch: ', JSON.stringify(payload));
        console.log('payload.contextType', payload.contextType);
        console.log('window.contextMap', window.contextMap)
        const clientArray = window.contextMap.get(payload.contextType);
        console.log('clientArray', clientArray);

        const broadcasterColor = window.colorMap.get(identity.name);

        const storedContextsForColor = window.colorContextMap.get(broadcasterColor);
        storedContextsForColor.set(payload.contextType, payload)
        
        for (let index = 0; index < clientArray.length; index++) {
            const client = clientArray[index];
            const clientColor = window.colorMap.get(client.name);

            console.log('broadcasterColor', broadcasterColor)
            console.log('clientColor', clientColor)
            if (broadcasterColor === clientColor) {
                interopBus.dispatch(client, 'receiveContext', payload);
            }
        }

        return {
            echo: payload
        };
    });

    interopBus.register('receiveContext', (payload, identity) => {
        const currentColor = window.colorMap.get(identity.name);
        const storedContextsForColor = window.colorContextMap.get(currentColor);
        console.log('storedContextsForColor', storedContextsForColor)
        for (const [contextType, contextPayload] of storedContextsForColor) {
            console.log('contextType', contextType)
            console.log('contextPayload', contextPayload)
            const clientArray = window.contextMap.get(contextType);
            console.log('clientArray', clientArray)
            const client = clientArray.find((potentialMatch) => potentialMatch.name === identity.name)
            if (client) {
                console.log('client', client)
                interopBus.dispatch(client, 'receiveContext', contextPayload)
                    .then(console.log)
                    .catch(console.error)
            }
        }
    })

    

    const colorChannelBus = await fin.InterApplicationBus.Channel.create('ColorChannelBroker');

    colorChannelBus.onConnection((identity, payload) => {
        // can reject a connection here by throwing an error
        console.log('colorChannelBus Client connection request identity: ', JSON.stringify(identity));
        console.log('colorChannelBus Client connection request payload: ', JSON.stringify(payload));
        console.log('colorChannelBus Client connection request payload: ', payload);
    });

    colorChannelBus.onDisconnection((identity, payload) => {
        // can reject a connection here by throwing an error
        console.log('colorChannelBus Client disconnection request identity: ', JSON.stringify(identity));
        console.log('colorChannelBus Client disconnection request payload: ', JSON.stringify(payload));
        console.log('colorChannelBus Client disconnection request payload: ', payload);
        const currentColor = window.colorMap.get(identity.name);
        console.log('currentColor', currentColor);
        window.colorMap.delete(identity.name);
        const storedContextsForColor = window.colorContextMap.get(currentColor);
        if (storedContextsForColor) {
            for (const [contextType, contextPayload] of storedContextsForColor) {
                console.log('contextType', contextType)
                console.log('contextPayload', contextPayload)
                const clientArray = window.contextMap.get(contextType);
                console.log('clientArray', clientArray)
                const newClientArray = clientArray.filter((potentialMatch) => potentialMatch.name !== payload.target.name)
                window.contextMap.set(contextType, newClientArray);
            }
        }
    });

    colorChannelBus.register('changeColorChannel', (payload, identity) => {
        // register a callback for a 'topic' to which clients can dispatch an action
        console.log('colorChannelBus Action dispatched by client: ', JSON.stringify(identity));
        console.log('colorChannelBus Payload sent in dispatch: ', JSON.stringify(payload));
        console.log('window.colorMap', window.colorMap);

        const oldColor = window.colorMap.get(payload.target.name);
        console.log('oldColor', oldColor)
        const newColor = payload.color;
        console.log('newColor', newColor)
        
        if (oldColor !== newColor) {
            window.colorMap.set(payload.target.name, newColor)
            // fin.View.wrapSync(payload.target).updateOptions({colorChannelDeclaration: newColor});
            const storedContextsForColor = window.colorContextMap.get(newColor);
            console.log('storedContextsForColor', storedContextsForColor)
            for (const [contextType, contextPayload] of storedContextsForColor) {
                console.log('contextType', contextType)
                console.log('contextPayload', contextPayload)
                const clientArray = window.contextMap.get(contextType);
                console.log('clientArray', clientArray)
                const client = clientArray.find((potentialMatch) => potentialMatch.name === payload.target.name)
                if (client) {
                    console.log('client', client)
                    interopBus.dispatch(client, 'receiveContext', contextPayload)
                        .then(console.log)
                        .catch(console.error)
                }
            }
        }


        return {
            echo: payload
        };
    });

    colorChannelBus.register('getColorSnapshot', (payload, identity) => {
        console.log('window.colorMap', window.colorMap)
        console.log('window.colorContextMap', window.colorContextMap)
        const colorContextSnapshot = Object.fromEntries(window.colorContextMap);
        for (let [key, value] of window.colorContextMap) {
            colorContextSnapshot[key] = Object.fromEntries(value)
        }
        return {
            colorMap: Object.fromEntries(window.colorMap),
            colorContextMap: colorContextSnapshot
        }
    })

    colorChannelBus.register('setColorSnapshot', (payload, identity) => {
        console.log('setColorSnapshot hit');
        console.log('before platform-snapshot-applied')
        fin.Platform.getCurrentSync().once('platform-snapshot-applied', () => {
            console.log('after platform-snapshot-applied')
            const colorChannelInfo = payload.colorChannelInfo;
            window.colorContextMap = new Map(Object.entries(colorChannelInfo.colorContextMap))
            console.log('window.colorContextMap', window.colorContextMap)
            for (let [key, value] of window.colorContextMap) {
                console.log('key', key)
                console.log('window.colorContextMap[key]', window.colorContextMap[key])
                console.log('colorChannelInfo.colorContextMap[key]', colorChannelInfo.colorContextMap[key])
                window.colorContextMap.set(key, new Map(Object.entries(colorChannelInfo.colorContextMap[key])))
            }
            console.log('window.colorContextMap', window.colorContextMap)


            window.colorMap = new Map(Object.entries(colorChannelInfo.colorMap))
            const colorMapIterable = Object.entries(colorChannelInfo.colorMap);
            for (const [entityName, entityColor] of colorMapIterable) {
                window.colorMap.set(entityName, entityColor)
                const storedContextsForColor = window.colorContextMap.get(entityColor);
                console.log('storedContextsForColor', storedContextsForColor)
                for (const [contextType, contextPayload] of storedContextsForColor) {
                    console.log('contextType', contextType)
                    console.log('contextPayload', contextPayload)
                    const clientArray = window.contextMap.get(contextType);
                    console.log('clientArray', clientArray)
                    const client = clientArray.find((potentialMatch) => potentialMatch.name === entityName)
                    if (client) {
                        console.log('client', client)
                    //     interopBus.dispatch(client, 'receiveContext', contextPayload)
                    //         .then(console.log)
                    //         .catch(console.error)
                    }
                }
            }
        })
    })
})();

