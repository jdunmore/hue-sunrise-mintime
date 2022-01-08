const v3 = require('node-hue-api').v3;



const remoteBootstrap = v3.api.createRemote(keys.ClientId, keys.ClientSecret);

remoteBootstrap.connectWithTokens(keys.access_token, keys.refresh_token, keys.username)
    .catch(err => {
        console.error('Failed to get a remote connection using existing tokens.');
        console.error(err);
        process.exit(1);
    })
    .then(api => {

        const credentials = api.remote.getRemoteAccessCredentials();
        // Display the credentials
        console.log(JSON.stringify(credentials, null, 2));
        console.log('Successfully connected using the existing OAuth tokens.');

        // Do something on the remote API, like list the lights in the bridge
        return api.lights.getAll()
            .then(lights => {
                console.log('Retrieved the following lights for the bridge over the Remote Hue API:');
                lights.forEach(light => {
                    console.log(light.toStringDetailed());
                });
            });
    });