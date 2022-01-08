import dayjs from 'dayjs';
import { getSunrisesunset } from './SunriseSunset.mjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat)

const sunSettings = {
    latitude: "51.8031083",
    longitude: "-0.2068872",
    tomorrow: dayjs().add(1, 'day'),
    minSunrise: dayjs("07:00:00 AM", "h:mm:ss A").add(1, 'day')
};

const sunData = await getSunrisesunset(
    sunSettings.tomorrow.format('YYYY-MM-DD'), 
    sunSettings.latitude, 
    sunSettings.longitude
);


let sunrise = dayjs(sunData.sunrise, "h:mm:ss A").add(1, 'day');


if(sunSettings.minSunrise.isAfter(sunrise)) {
    console.log("Min time is after sunrise");
    //We won't do anything, except maybe schedule a backup off command just in case a light was left on
} else {
    console.log("min sunrise is before sunrise");

    //New module for some logic about deciding light fade times
    //Then call hue schedule with those times


}

//TODO
// 0. setup git repo and npm init -- add config values to a json file that doesn't get committed
// 0.1 delete the rotateHueKeys and delete un-used moduels
// 1. create the hue logic for my bit - use the test.js in rotateHueKey and turn a light on
// 2. Implement a rotate keys, use a local json file
// 3. move that file to S3
// 4. Create logic for the fade times, that can live in the hue logic file
// 5. Run it for real with the schedule - get it running for a few days
// 6. Use the servless scripts to export to AWS and run in a lambda as step function
//     or, why not just run it in a node.js container?
// 8. Remove un-used modules

/*

getSunRiseTime

if sunriseTime < 7.15 AM (don't forget timezones) :
    We don't do anything, but should schedule a backup switch off lounge light at 30mins past sunrise just in case

else 


*/