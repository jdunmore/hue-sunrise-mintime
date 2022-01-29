import dayjs from 'dayjs';
import { getSunrisesunset } from './SunriseSunset.mjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { getConfig, putConfig } from './s3ConfigStorage.mjs';
import { getApi, getScheduleFadeCommand, ON, OFF, createSchedule } from './HueIntegration.mjs';

console.log("Starting API " + new dayjs().format("YYYY-MM-DD HH:mm:ss"));

dayjs.extend(customParseFormat)

const sunSettings = {
    latitude: "51.8031083",
    longitude: "-0.2068872",
    tomorrow: dayjs().add(1, 'day'),
    minSunrise: dayjs("07:01:00 AM", "h:mm:ss A").add(1, 'day')
};

const sunData = await getSunrisesunset(
    sunSettings.tomorrow.format('YYYY-MM-DD'),
    sunSettings.latitude,
    sunSettings.longitude
);


let sunrise = dayjs(sunData.sunrise, "h:mm:ss A").add(1, 'day');


if (sunSettings.minSunrise.isAfter(sunrise)) {
    console.log("Min time is after sunrise");
    //We won't do anything, except maybe schedule a backup off command just in case a light was left on
} else {
    console.log("min sunrise is before sunrise " + sunrise.format('YYYY-MM-DD HH:mm:ss'));

    const config = await getConfig();
    const api = await getApi(config, putConfig);

    const onTime = new dayjs().add(1, 'day');
    const onTimeFormatted = onTime.format('YYYY-MM-DDT06:45:00');

    const onSchedule = await getScheduleFadeCommand(
        4, ON, onTimeFormatted, 'Pre sunrise on', 'Automate morning on from hue API at ' + onTimeFormatted
    );

    await createSchedule(api, onSchedule).catch(err => {
        console.log("schedule already exists");  
    });
  
    const offTimeFormatted = sunrise.format('YYYY-MM-DDTHH:mm:ss');

    const offSchedule = await getScheduleFadeCommand(
        4, OFF, offTimeFormatted, 'Pre sunrise off', 'Automate morning off from hue API at ' + offTimeFormatted
    );

    await createSchedule(api, offSchedule).catch(err => {
        console.log("schedule already exists");  
    });

}

//TODO

//
// 6. Use the servless scripts to export to AWS and run in a lambda as step function
//     or, why not just run it in a node.js container?
// 8. Remove un-used modules
// 9. Work out timezones

//node --experimental-specifier-resolution=node -r dotenv/config .\app.js
