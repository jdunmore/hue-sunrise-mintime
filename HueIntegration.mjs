import { v3 } from "node-hue-api"
import fs from "fs"
import dayjs from "dayjs";

const ON = 'on';
const OFF = 'OFF';

// const getAuthData = async () => {
//     let rawdata = fs.readFileSync('.config.json');
//     let authdata = JSON.parse(rawdata);
//     return authdata;
// };

// let authdata = await getAuthData();


const getApi = async (authdata, putConfig) => {
    const remoteBootstrap = v3.api.createRemote(authdata.clientId, authdata.clientSecret);

    try {
        const api = await remoteBootstrap.connectWithTokens(authdata.tokens.access.value, authdata.tokens.refresh.value, authdata.username);

        const apiExpiry = dayjs(authdata.tokens.access.expiresAt);
        const maxExpiry = dayjs().add(2, 'day');
        if (apiExpiry.isBefore(dayjs().add(2, 'day'))) {

            console.log("Keys expired. API expiry " + apiExpiry.format() + " is before " + maxExpiry.format());
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

                    putConfig(authdata);

                });
        }
        return api;
    } catch (error) {
        console.error('Failed to get a remote connection using existing tokens.');
        console.error(authdata)
        console.error(error);
        process.exit(1);
    }

};

const getScheduleFadeCommand = async (groupId, onOrOff, startTime, name, description) => {
    const model = v3.model;
    const schedule = model.createSchedule();
    schedule.name = name;
    schedule.description = description;

    //https://github.com/peter-murray/node-hue-api/blob/main/docs/timePatterns.md
    schedule.localtime = model.timePatterns.createAbsoluteTime(startTime);

    if (onOrOff == ON) {
        schedule.command = model.actions.group(groupId).withState(
            new model.lightStates.GroupLightState()
                .on()
                .brightness(100)
                //.work out scene
                .transition(900000)
        );
    } else {
        schedule.command = model.actions.group(groupId).withState(
            new model.lightStates.GroupLightState()
                .off()
                //.work out scene
                .transition(900000)
        );
    }

    return schedule;

};

let allSchedules;

const getAllSchedules = async (api) => {

    if(allSchedules === undefined) {
        try {
            console.log("Schedules empty, fetching them");
            allSchedules = await api.schedules.getAll();
        } catch (error){
            console.error("failed to get schedules");
            console.error(error);
        }
    }
    return allSchedules;
};

const createSchedule = async (api, schedule) => {

    const scheduleTime = schedule.data.localtime;
    const allSchedules = await getAllSchedules(api);
    
    allSchedules.forEach(schedule => {
        if(scheduleTime == schedule.localtime){
            throw "Schedule Already Exists";
        }    
    });

    api.schedules.createSchedule(schedule)
        .catch(err => {
            console.error('Failed to schedule');
            console.error(err);
        })
        .then(createdSchedule => {
            console.log(`Successfully created Schedule\n${createdSchedule.toStringDetailed()}`);
        });
};



export { getApi, getScheduleFadeCommand, ON, OFF, createSchedule, getAllSchedules };


// api.schedules.getAll().then(allSchedules => {
//     allSchedules.forEach(schedule => {
//         console.log(schedule.toStringDetailed());
//     });
// });

// api.schedules.getSchedule(1)
//     .then(schedule => {
//         console.log(schedule.toStringDetailed());
//     });


// api.groups.getAll()
//   .then(allGroups => {
//     // Display the groups from the bridge
//     allGroups.forEach(group => {
//       console.log(group.toStringDetailed());
//     });
//   });

// api.schedules.getSchedule(1)
//     .then(schedule => {
//         console.log(schedule.toStringDetailed());
//     });


// console.log("Got API");

// api.lights.getAll()
//     .then(lights => {
//         console.log('Retrieved the following lights for the bridge over the Remote Hue API:');
//         lights.forEach(light => {
//             console.log(light.toStringDetailed());
//         });
//     });


