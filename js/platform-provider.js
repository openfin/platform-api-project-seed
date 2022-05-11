fin.Platform.init();

(async () => {
    const CHANNEL_NAME = 'dotnet';
    console.log('initalizing dotnet provider');
    await fin.System.launchExternalProcess({ 
        alias: 'dotnet-provider', 
        arguments: `--runtime-version=22.94.66.4 --channel-name=${CHANNEL_NAME}`
    });
    console.log('dotnet provider launched successfully');
    try {
        const client = await fin.InterApplicationBus.Channel.connect(CHANNEL_NAME, {wait: false, payload: { foo: 'bar' }});
        console.log(`successfully connected to ${CHANNEL_NAME}`);
    } catch (error) {
        console.log(`failed to connect to ${CHANNEL_NAME}: ${error}`);
    }
})();