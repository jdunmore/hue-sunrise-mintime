import { v3 } from "node-hue-api"
import fs from "fs"
import dayjs from "dayjs";

const getAuthData = async () => {
    let rawdata = fs.readFileSync('.config.json');
    let authdata = JSON.parse(rawdata);
    return authdata;
};

let authdata = await getAuthData();


const getApi = async (authdata) => {
    const remoteBootstrap = v3.api.createRemote(authdata.clientId, authdata.clientSecret);

    try {
        const api = await remoteBootstrap.connectWithTokens(authdata.tokens.access.value, authdata.tokens.refresh.value, authdata.username);

        const apiExpiry = dayjs(authdata.tokens.access.expiresAt);
        const maxExpiry = dayjs().add(2, 'day');
        if (apiExpiry.isBefore(dayjs().add(2, 'day'))) {

            console.log(apiExpiry.format() + " is before " + maxExpiry.format());
            api.remote.refreshTokens()
                .catch(err => {
                    console.error('Failed to refresh tokens');
                    console.error(err);
                    process.exit(1);
                })
                .then(data => {
                    console.log("Got new Tokens");
                    console.log(data);
                    authdata.tokens.access.value = data.accessToken.value;
                    authdata.tokens.access.expiresAt = data.accessToken.expiresAt;
                    authdata.tokens.refresh.value = data.refreshToken.value;
                    authdata.tokens.refresh.expiresAt = data.refreshToken.expiresAt;

                    console.log("Writing new AuthData");
                    console.log(authdata);

                    let filedata = JSON.stringify(authdata);
                    fs.writeFileSync('.config.json', filedata);

                });
        }

        return api;
    } catch (error) {
        console.error('Failed to get a remote connection using existing tokens.');
        console.error(error);
        process.exit(1);
    }

};


const api = await getApi(authdata);


console.log("Got API");

api.lights.getAll()
    .then(lights => {
        console.log('Retrieved the following lights for the bridge over the Remote Hue API:');
        lights.forEach(light => {
            console.log(light.toStringDetailed());
        });
    });
