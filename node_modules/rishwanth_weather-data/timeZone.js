// Maintain All methods and data inside WeatherForTimeZone class
class WeatherForTimeZones {
	constructor() {
		this.timeZones = {
			Nome: this.getTimeForZone({ timeZone: "America/Nome" }),
			NewYork: this.getTimeForZone({ timeZone: "America/Los_angeles" }),
			Jamaica: this.getTimeForZone({ timeZone: "America/Jamaica" }),
			LosAngeles: this.getTimeForZone({ timeZone: "America/Los_Angeles" }),
			Winnipeg: this.getTimeForZone({ timeZone: "America/Winnipeg" }),
			Juba: this.getTimeForZone({ timeZone: "Africa/Juba" }),
			Maseru: this.getTimeForZone({ timeZone: "Africa/Maseru" }),
			London: this.getTimeForZone({ timeZone: "Europe/London" }),
			Vienna: this.getTimeForZone({ timeZone: "Europe/Vienna" }),
			Moscow: this.getTimeForZone({ timeZone: "Europe/Moscow" }),
			Dublin: this.getTimeForZone({ timeZone: "Europe/Dublin" }),
			Karachi: this.getTimeForZone({ timeZone: "Asia/Karachi" }),
			Kolkata: this.getTimeForZone({ timeZone: "Asia/Kolkata" }),
			Yangon: this.getTimeForZone({ timeZone: "Asia/Yangon" }),
			BangKok: this.getTimeForZone({ timeZone: "Asia/Bangkok" }),
			Seoul: this.getTimeForZone({ timeZone: "Asia/Seoul" }),
			Anadyr: this.getTimeForZone({ timeZone: "Asia/Anadyr" }),
			BrokenHill: this.getTimeForZone({ timeZone: "Australia/Broken_Hill" }),
			Perth: this.getTimeForZone({ timeZone: "Australia/Perth" }),
			Auckland: this.getTimeForZone({ timeZone: "pacific/Auckland" }),
			Vostok: this.getTimeForZone({ timeZone: "Antarctica/Vostok" }),
			Troll: this.getTimeForZone({ timeZone: "Antarctica/Troll" }),
		};
		this.timeZoneKeys = Object.keys(this.timeZones);
	}
	// return exact time for the particular city - real time using JS methods
	getTimeForZone(timeZone) {
		let time = new Date().toLocaleString("en-US", timeZone);
		time = new Date(time);
		return time.toLocaleString();
	}
	// return temperature btw min and max range
	getTempBtwRange(min, max, appendDegC = true) {
		if (appendDegC) return Math.floor(Math.random() * (max - min) + min) + "°C";
		return Math.floor(Math.random() * (max - min) + min);
	}
	// Conditions: Max temp 50 C (0% humid) & 0 C (100% humid)
	getHumidity(temp) {
		if (temp < 0) return "100%";
		if (temp >= 50) return "0%";
		return parseInt((-100 / 48) * temp + 100) + "%";
	}
	// Conditions: Max temp 50 C (100% precip) & 0 C (0% precip)
	getPrecipitation(temp) {
		if (temp < 0) return "0%";
		if (temp >= 50) return "100%";
		return parseInt(temp * 2) + "%";
	}
	// complete info of weather for particular city
	getWeather(city, timeZone, minTemp, maxTemp) {
		let temp = this.getTempBtwRange(minTemp, maxTemp);
		return {
			cityName: city,
			dateAndTime: this.getTimeForZone({ timeZone: timeZone }),
			timeZone: timeZone,
			temperature: temp,
			humidity: this.getHumidity(Number(temp.split("°C")[0])),
			precipitation: this.getPrecipitation(Number(temp.split("°C")[0])),
		};
	}
	// return time date city for one city
	getTimeForOneCity(cityName) {
		let self = this;
		if (this.timeZoneKeys.includes(cityName)) {
			return {
				city_Date_Time_Name: `${self.timeZones[cityName]}, ${cityName}`,
			};
		} else {
			return {
				error: "Please request a valid city name",
			};
		}
	}
	// return  weather forecast for upcoming hours for one city
	nextNhoursWeather(cityTDN, hours, lastForeCast) {
		let nHours = Number(hours) > 5 ? 5 : Number(hours) < 1 ? 5 : Number(hours);
		let city = cityTDN.replace(/\s/g, "").split(",")[2];
		for (let i = 0; i < lastForeCast.length; i++) {
			if (lastForeCast[i].cityName.toLowerCase() === city.toLowerCase()) {
				let temp = Number(lastForeCast[i].temperature.split("°C")[0]);
				let data = {
					hours: [`+1 Hour`, `+2 Hour`, `+3 Hour`, `+4 Hour`, `+5 Hour`],
					temperature: [
						`${temp}°C`,
						`${temp + this.getTempBtwRange(0, 6, false)}°C`,
						`${temp - this.getTempBtwRange(0, 5, false)}°C`,
						`${temp + this.getTempBtwRange(0, 6, false)}°C`,
						`${temp - this.getTempBtwRange(0, 5, false)}°C`,
					],
				};
				return {
					hours: data.hours.splice(0, nHours),
					temperature: data.temperature.splice(0, nHours),
				};
			}
		}
		return {
			error: "No valid city found.Check API Doc",
		};
	}
}
const WeatherIns = new WeatherForTimeZones();
// export functions
const timeForOneCity = (cityName) => {
	return WeatherIns.getTimeForOneCity(cityName);
};
const nextNhoursWeather = (cityTDN, hours, lastForecast) => {
	return WeatherIns.nextNhoursWeather(cityTDN, hours, lastForecast);
};
const allTimeZones = () => {
	return [
		WeatherIns.getWeather("Nome", "America/Nome", -19, 10), //@params cityName,TimeZone,minTemperature,maxTemperature
		WeatherIns.getWeather("NewYork", "America/New_york", 1, 25),
		WeatherIns.getWeather("Jamaica", "America/Jamaica", 22, 31),
		WeatherIns.getWeather("LosAngeles", "America/Los_Angeles", 19, 26),
		WeatherIns.getWeather("Winnipeg", "America/Winnipeg", 2, 35),
		WeatherIns.getWeather("Juba", "Africa/Juba", 10, 45),
		WeatherIns.getWeather("Maseru", "Africa/Maseru", 15, 50),
		WeatherIns.getWeather("London", "Europe/London", -16, 38),
		WeatherIns.getWeather("Vienna", "Europe/Vienna", -2, 35),
		WeatherIns.getWeather("Moscow", "Europe/Moscow", 8, 20),
		WeatherIns.getWeather("Dublin", "Europe/Dublin", 2, 50),
		WeatherIns.getWeather("Karachi", "Asia/Karachi", 19, 32),
		WeatherIns.getWeather("Kolkata", "Asia/Kolkata", 20, 37),
		WeatherIns.getWeather("Yangon", "Asia/Yangon", 20, 39),
		WeatherIns.getWeather("BangKok", "Asia/BangKok", 26, 36),
		WeatherIns.getWeather("Seoul", "Asia/Seoul", 1, 23),
		WeatherIns.getWeather("Anadyr", "Asia/Anadyr", -23, 1),
		WeatherIns.getWeather("BrokenHill", "Australia/Broken_Hill", 7, 20),
		WeatherIns.getWeather("Perth", "Australia/Perth", 5, 24),
		WeatherIns.getWeather("Auckland", "Pacific/Auckland", 10, 20),
		WeatherIns.getWeather("Vostok", "Antarctica/Vostok", -54, -70),
		WeatherIns.getWeather("Troll", "Antarctica/Troll", -50, -72),
	];
};
module.exports = {
	allTimeZones,
	timeForOneCity,
	nextNhoursWeather,
};
