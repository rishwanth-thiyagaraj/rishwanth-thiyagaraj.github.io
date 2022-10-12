var weather_data = {};
/**
 * Get the weather data of all the cities from the given url.
 *
 * @return {Array} Array of city objects with their respective weather details.
 */
function getWeatherDetails() {
	let promise = new Promise((resolve, reject) => {
		var requestOptions = {
			method: "GET",
			redirect: "follow",
		};
		fetch("http://localhost:8888/all-timezone-cities", requestOptions)
			.then((data) => {
				resolve(data.json());
			})
			.catch((err) => {
				reject(err);
			});
	});
	return promise;
}

/**
 * Get the temperature of next five hours for a particular city.
 *
 * @param {Object} raw Object with cityname and hours properties.
 * raw={city_Date_time_Name:26/09/2022,hours:6}
 *
 * @return {Object} 2 Arrays of next hours' temperature and number of hours
 * {hours:(5) ['+1 Hour', '+2 Hour', '+3 Hour', '+4 Hour', '+5 Hour'],
 * temperature: (5) ['-13°C', '-11°C', '-11°C', '-13°C', '-14°C']}
 */
async function getNextFiveHoursData(raw) {
	try {
		let nextFive = await fetch("http://localhost:8888/hourly-forecast", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(raw),
		});
		if (nextFive.ok) {
			let nextTemperature = await nextFive.json();
			return nextTemperature;
		} else {
			alert("Data not Fetched properly");
		}
	} catch {
		(error) => console.log("error", error);
	}
}
/**
 * Retrieve date and Time object for a particular city.
 * The retrieved object is passed as parameter to another function.
 *
 * @param {string} cityName the name of the city of which data is to be retrieved
 * @return {Object} the date and time of a particular city.
 */
async function getDateandTimeData(cityName, flag) {
	var requestOptions = {
		method: "GET",
		redirect: "follow",
	};
	try {
		if (flag == 0) {
			let date = await fetch(
				`http://localhost:8888/city/?city=${cityName}`,
				requestOptions
			);
			if (date.ok) {
				const data = await date.json();
				console.log(data);
				return data;
			} else {
				const errorMessage = await date.json();
				alert(`${errorMessage.Error}\n\nSending default Anadyr's data`);
				// Load default city's data when there is error in data fetching.
				document.getElementById("city").value = "Anadyr";
				selectedCity = "Anadyr";
				date = await fetch(
					"http://localhost:8888/city/?city=Anadyr",
					requestOptions
				);
				const data = await date.json();
				return data;
			}
		} else {
			let date = await fetch(
				"http://localhost:8888/city/?city=Anadyr",
				requestOptions
			);
			const data = await date.json();
			return data;
		}
	} catch {
		(error) => console.log("error", error);
	}
}

/**
 * Converts the array of city objects into nested objects.
 * The city name is given as the key for the newly formed nested object.
 *
 * @param {Array} list The array that is to be converted into nested objects.
 * @param {string} item The property that is to be set as key.
 * @return {Object} The nested object which contains all city objects.
 */
function convertArrayToObj(list, item) {
	return list.reduce((obj, key) => {
		obj[key[item].toLowerCase()] = key;
		return obj;
	}, {});
}

/**
 * Retrieves the next five hours temperature and returns it.
 *
 * @param {string} cityName
 * @return {Array} Array of next five hours temperature of a particular city.
 * eg:
 * ['-13°C', '-11°C', '-11°C', '-13°C', '-14°C'](5)
 */
async function getFutureTemperature(cityName, flag) {
	let dateTime = await getDateandTimeData(cityName, flag);
	dateTime.hours = 6;
	let nextFiveTemperatures = await getNextFiveHoursData(dateTime);
	return nextFiveTemperatures.temperature;
}

/**
 * Retrieves the weather details of all cities.
 *
 */
async function getWeatherReport() {
	let data = await getWeatherDetails();
	weather_data = convertArrayToObj(data, "cityName");
}

/**
 * Wait for necessary data to be retrieved and stored and then execute the functionalities of the webpage.
 *
 */
function updateWeatherApp() {
	getWeatherReport().then(() => loadWeatherApp());
}
updateWeatherApp();
setInterval(updateWeatherApp, 3600000);
