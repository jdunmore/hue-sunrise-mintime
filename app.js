import dayjs from 'dayjs';
import { getSunrisesunset } from './SunriseSunset.mjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { getConfig, putConfig } from './s3ConfigStorage.mjs';
import { getApi, getScheduleFadeCommand, ON, OFF, createSchedule, getAllSchedules } from './HueIntegration.mjs';

console.log("Starting API " + new dayjs().format("YYYY-MM-DD HH:mm:ss"));

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const sunSettings = {
    latitude: "51.8031083",
    longitude: "-0.2068872",
    tomorrow: dayjs().add(1, 'day'),
    minSunrise: dayjs.tz("07:01:00 AM", "h:mm:ss A", "Europe/London").add(1, 'day')
};

const sunData = await getSunrisesunset(
    sunSettings.tomorrow.format('YYYY-MM-DD'),
    sunSettings.latitude,
    sunSettings.longitude
);


let sunrise = dayjs.tz(sunData.sunrise, "h:mm:ss A","UTC").add(1, 'day');

console.log("Sunrise is" + sunrise.format('YYYY-MM-DDTHH:mm:ss'));
console.log("Sunrise formatted is" + sunrise.tz("Europe/London").format('YYYY-MM-DDTHH:mm:ss'));


if (sunSettings.minSunrise.isAfter(sunrise)) {
    console.log("Min time is after sunrise");
    //We won't do anything, except maybe schedule a backup off command just in case a light was left on
} else {
    console.log("min sunrise is before sunrise " + sunrise.format('YYYY-MM-DD HH:mm:ss'));

    const config = await getConfig();
    const api = await getApi(config, putConfig);

    // api.schedules.deleteSchedule(2);
    // api.schedules.deleteSchedule(3);

    const allS = await getAllSchedules(api);

    
    console.log(allS);

    const onTime = new dayjs().add(1, 'day').tz("Europe/London", true);
    const onTimeFormatted = onTime.format('YYYY-MM-DDT06:45:00');

    const onSchedule = await getScheduleFadeCommand(
        4, ON, onTimeFormatted, 'Pre sunrise on', 'Automate morning on from hue API at ' + onTimeFormatted
    );

    await createSchedule(api, onSchedule).catch(err => {
        console.log("schedule already exists");  
    });
  
    const offTimeFormatted = sunrise.tz("Europe/London").format('YYYY-MM-DDTHH:mm:ss');

    const offSchedule = await getScheduleFadeCommand(
        4, OFF, offTimeFormatted, 'Pre sunrise off', 'Automate morning off from hue API at ' + offTimeFormatted
    );

    await createSchedule(api, offSchedule).catch(err => {
        console.log("schedule already exists");  
    });

}

//TODO

//     or, why not just run it in a node.js container?
// 8. Remove un-used modules


//node --experimental-specifier-resolution=node -r dotenv/config .\app.js
