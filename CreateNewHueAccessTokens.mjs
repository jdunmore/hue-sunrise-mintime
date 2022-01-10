/*
Connecting to HUE needs an auth token.
Assuming you've followed the guide from node-hue-api on first time setup, this script is
for generating new access tokens.

First time you run it, it will error as your authCode will be expired. The CLI will give you a URL
Pop that in the browser, get the resultant authCode from the browser redirect then put that in the auth data

Run the script, you'll then get new auth tokens. Put them in the config.json and you'll be good to go
*/

import { v3 } from "node-hue-api"
import fs from "fs"
import dayjs from "dayjs";

const getAuthData = async () => {
    let rawdata = fs.readFileSync('.config.json');
    let authdata = JSON.parse(rawdata);
    return authdata;
};

let authdata = await getAuthData();

const getNewAuthToken = async (authdata) => { 
    const remoteBootstrap = v3.api.createRemote(authdata.ClientId, authdata.ClientSecret);
    remoteBootstrap.connectWithCode(authdata.AuthCode)
    .catch(err => {
      console.error('Failed to get a remote connection using authorization code.');
      //This WILL fail after a few hours and you'll need this URL to generate a new code
      //Then put that code into the config. 
      console.log(`${remoteBootstrap.getAuthCodeUrl('node-hue-api-remote', authdata.AppId, 'OK')}`);
      console.error(err);
      process.exit(1);
    })
    .then(api => {
      console.log('Successfully validated authorization code and exchanged for tokens');

      const remoteCredentials = api.remote.getRemoteAccessCredentials();

      // Display the tokens and username that we now have from using the authorization code. These need to be stored
      // for future use.
      console.log(`Remote API Access Credentials:\n ${JSON.stringify(remoteCredentials, null, 2)}\n`);
      console.log(`The Access Token is valid until:  ${new Date(remoteCredentials.tokens.access.expiresAt)}`);
      console.log(`The Refresh Token is valid until: ${new Date(remoteCredentials.tokens.refresh.expiresAt)}`);
      console.log('\nNote: You should securely store the tokens and username from above as you can use them to connect\n'
        + 'in the future.');
    });

    return 0;
}

const nat = await getNewAuthToken(authdata);