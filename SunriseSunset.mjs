import fetch from 'node-fetch';

const getSunrisesunset = async (date, latitude, longitude) => {

    const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}`;
    const response = await fetch(url);
    const data = await response.json();
    // sunrise, sunset
    // civil_twilight_begin, civil_twilight_end
    // nautical_twilight_begin, nautical_twilight_end
    // astronomical_twilight_begin, astronomical_twilight_end
    // IMO nautical_twilight works best to start lights
    return data.results;
};

export {getSunrisesunset};