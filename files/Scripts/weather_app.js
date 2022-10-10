class WeatherReport {
	constructor(weather_data) {
		this.weather_data = weather_data;
	}
	/**
	 * Function to retrieve city names from the json file and append to datalist
	 */
	importCity() {
		let citylist = document.getElementById("cities-list");
		for (let city in weather_data) {
			let options = document.createElement("option");
			options.setAttribute("value", weather_data[city].cityName);
			citylist.appendChild(options);
		}
	}

	/**
	 * Function to update top section data based on the selected city.
	 * The function invokes several function calls to update the data in the top section.
	 *
	 * @return {void} Nothing
	 */
	async updateTopSectionData() {
		let interval;
		let selectedCity = document.getElementById("city").value; //selectedCity is converted to Lowercase to match the name in json file.
		//check if the input is not in the given list of cities in the json file
		const currentCity = new CurrentCity();
		if (!(selectedCity.toLowerCase() in weather_data)) {
			currentCity.updateNilValuesForInvalidInput();
			return;
		}
		currentCity.nextFiveHrs = await getFutureTemperature(selectedCity);

		let SelectedCity = selectedCity.toLowerCase();
		currentCity.setProperties(SelectedCity);
		currentCity.updateCityIcon();
		currentCity.updateDate();
		currentCity.updateTime();
		currentCity.updateTemperature()();
		currentCity.updateHumidityAndPrecipitation();
	}

	/**
	 * This function calls for the creation of cards for the preferred weather cities.
	 * The number of cards created depends on the number of cities in each weather list as well as user's preferred number.
	 *
	 * @param {Array} citiesList The cities list for which city cards have to be created.
	 * @return {void} Nothing
	 *
	 */
	updateCityCards() {
		document.getElementById("card-container").replaceChildren();
		let preferred_icon;
		let spinner_value = document.getElementById("spinner-input");
		spinner_value.max =
			Object.keys(this.weather_data).length <= 3 ||
			Object.keys(this.weather_data).length < 10
				? Object.keys(this.weather_data).length
				: 10;
		let numberOfCards = spinner_value.value;
		if (parseInt(Object.values(this.weather_data)[1].temperature) > 29)
			preferred_icon = "Assets/WeatherIcons/sunnyIcon.svg";
		else if (parseInt(Object.values(this.weather_data)[1].temperature) <= 20)
			preferred_icon = "Assets/WeatherIcons/rainyIcon.svg";
		else preferred_icon = "Assets/WeatherIcons/snowflakeIcon.svg";
		for (let city in this.weather_data) {
			let cityObj = new CurrentCity();
			cityObj.setProperties(city);
			cityObj.createCityCard(preferred_icon);
			numberOfCards--;
			if (numberOfCards == 0) break;
		}
	}
	/**
	 * This function highlights the icon that has been selected with a bottom border
	 *
	 * @param {string} icon_id The id of the icon selected in preferred weather selection.
	 * @return {void} Nothing
	 */
	selectIcon(icon_id) {
		document.getElementById("sun-icon").style.border = "none";
		document.getElementById("snow-icon").style.border = "none";
		document.getElementById("rain-icon").style.border = "none";
		document.getElementById(icon_id).style.borderBottom = "3px solid #00c0f1";
		document.getElementById("spinner-input").value =
			document.getElementById("spinner-input").min;
	}
	/**
	 * This function displays buttons for scrolling if the content overflows and has to be scrolled to view all content.
	 * This function is called every 1000 milliseconds to check for scrollable content.
	 * This function also implements the scrolling functionality in the displayed buttons.
	 *
	 */
	displayButton() {
		const buttonRight = document.getElementById("scroll-right-button");
		const buttonLeft = document.getElementById("scroll-left-button");
		if (checkOverflow()) {
			buttonRight.style.display = "initial";
			buttonLeft.style.display = "initial";
			const card_container = document.getElementById("card-container");
			const card = document.getElementById("city-card");
			buttonRight.onclick = () => {
				card_container.scrollLeft += 2 * card.clientWidth + 160;
			};
			buttonLeft.onclick = () => {
				card_container.scrollLeft -= 2 * card.clientWidth + 160;
			};
		} else {
			buttonLeft.style.display = "none";
			buttonRight.style.display = "none";
		}
		function checkOverflow() {
			let card_container = document.getElementById("card-container");
			return card_container.scrollWidth > card_container.clientWidth;
		}
	}
	/**
	 * This function is self invoking and contains all the functions that has to be performed in the middle section.
	 *
	 *
	 * @return {void} Nothing
	 */
	updateMiddleSection() {
		//sunnyCities contains city objects whose weather conditions are sunny.
		let sunnyCities = Object.entries(weather_data).filter(([key, value]) => {
			return (
				parseInt(value.temperature) > 29 &&
				parseInt(value.precipitation) >= 50 &&
				parseInt(value.humidity) < 50
			);
		});

		//rainyCities contains city objects whose weather conditions are rainy.
		let rainyCities = Object.entries(weather_data).filter(([key, value]) => {
			return (
				parseInt(value.temperature) <= 20 && parseInt(value.humidity) >= 50
			);
		});
		//coldCities contains city objects whose weather conditions are cold.
		let coldCities = Object.entries(weather_data).filter(([key, value]) => {
			return (
				parseInt(value.temperature) > 20 &&
				parseInt(value.temperature) < 28 &&
				parseInt(value.humidity) > 50 &&
				parseInt(value.precipitation) < 50
			);
		});

		sunnyCities = weather_info.sortCitiesBasedOnCriteria(
			sunnyCities,
			"temperature"
		);
		rainyCities = weather_info.sortCitiesBasedOnCriteria(
			rainyCities,
			"humidity"
		);
		coldCities = weather_info.sortCitiesBasedOnCriteria(
			coldCities,
			"precipitation"
		);
		sunnyCities = Object.fromEntries(sunnyCities);

		rainyCities = Object.fromEntries(rainyCities);
		coldCities = Object.fromEntries(coldCities);
		let sunnyCitiesObject = new WeatherReport(sunnyCities);
		let rainyCitiesObject = new WeatherReport(rainyCities);
		let coldCitiesObject = new WeatherReport(coldCities);
		let preferred_weather = rainyCities;
		rainyCitiesObject.updateCityCards();
		document.getElementById("sun-button").addEventListener("click", () => {
			sunnyCitiesObject.selectIcon("sun-icon");
			preferred_weather = sunnyCities;
			sunnyCitiesObject.updateCityCards();
		});
		document.getElementById("rain-button").addEventListener("click", () => {
			rainyCitiesObject.selectIcon("rain-icon");
			preferred_weather = rainyCities;
			rainyCitiesObject.updateCityCards();
		});
		document.getElementById("snow-button").addEventListener("click", () => {
			coldCitiesObject.selectIcon("snow-icon");
			preferred_weather = coldCities;
			coldCitiesObject.updateCityCards();
		});
		document.getElementById("spinner-input").addEventListener("change", () => {
			let preferredWeather = new WeatherReport(preferred_weather);
			preferredWeather.updateCityCards();
		});
	}

	/**
	 * This function sorts the list according to continent's name first and then with temperature.
	 * The sorting is done based on the direction of arrows of continent and temperature.
	 *
	 * @param {string} continent_sort_button_id The id of the continent's sort direction button.
	 * @param {string} temperature_sort_button_id The id of the temperature's sort direction button.
	 * @param {Array} continent_list The list of cities in array format.
	 */
	sortContinents(continent_sort_button_id, temperature_sort_button_id) {
		let continent_arrow_element = continent_sort_button_id.children[0];
		let temperature_arrow_element = temperature_sort_button_id.children[0];
		//This part sorts the temperature within the sorted same continent names
		return Object.entries(weather_data).sort(([, a], [, b]) => {
			if (a.timeZone.split("/")[0] == b.timeZone.split("/")[0]) {
				if (temperature_arrow_element.name == "arrow-up")
					return parseInt(a.temperature) < parseInt(b.temperature) ? 1 : -1;
				else return parseInt(a.temperature) < parseInt(b.temperature) ? -1 : 1;
			} else {
				if (continent_arrow_element.name == "arrow-up")
					return a.timeZone.split("/")[0] < b.timeZone.split("/")[0] ? 1 : -1;
				else
					return a.timeZone.split("/")[0] < b.timeZone.split("/")[0] ? -1 : 1;
			}
		});
	}
	/**
	 * This function invokes the function to create tile for each city in the list.
	 * The number of tiles created is restricted to 12.
	 *
	 * @param {Array} continent_list The data of cities after sorting
	 */
	updateTiles() {
		document.getElementById("tile-container").replaceChildren();
		for (let i = 0; i < 12; i++) {
			let cityObj = new CityTile();
			cityObj.setProperties(Object.keys(this.weather_data)[i]);
			cityObj.createTilesInBottomContainer();
		}
	}
	/**
	 * This function changes the direction of arrow when clicked. It changes up arrow to down arrow when clicked and vice-versa.
	 *
	 * @param {string} button_id The id of the arrow button. It can be either continent's or temperature's.
	 * @return {void} Nothing
	 */
	updateArrow(button_id) {
		let arrow_image = document.getElementById(button_id).children[0];
		if (arrow_image.name == "arrow-down") {
			arrow_image.src = "Assets/GeneralImages&Icons/arrowUp.svg";
			arrow_image.name = "arrow-up";
		} else {
			arrow_image.src = "Assets/GeneralImages&Icons/arrowDown.svg";
			arrow_image.name = "arrow-down";
		}
	}

	/**
	 * This function sorts the passed list based on the property that is passed.
	 *
	 * @param {Array} citiesList The list of cities that is to be sorted
	 * @param {string} criteria The property by which the citiesList has to be sorted
	 * @return {*}
	 */
	sortCitiesBasedOnCriteria(citiesList, criteria) {
		citiesList.sort(([, a], [, b]) => {
			return parseInt(b[criteria]) > parseInt(a[criteria]) ? 1 : -1;
		});
		return citiesList;
	}
	/*
	 * This self invoking function fetches all cities' data as an array and adds an event listener to the arrows in bottom section
	 * and calls the respective sort function and updates the tiles in the bottom container.
	 */
	updateBottomSection() {
		let continent_list = Object.entries(weather_info.weather_data);
		let cont_button_id = document.getElementById("continent-sort-button");
		let temp_button_id = document.getElementById("temperature-sort-button");
		continent_list = Object.fromEntries(
			weather_info.sortContinents(
				cont_button_id,
				temp_button_id,
				continent_list
			)
		);
		let continentObject = new WeatherReport(continent_list);
		continentObject.updateTiles(continent_list);
		cont_button_id.addEventListener("click", () => {
			weather_info.updateArrow(cont_button_id.id);
			continent_list = Object.fromEntries(
				weather_info.sortContinents(
					cont_button_id,
					temp_button_id,
					continent_list
				)
			);
			let continentObject = new WeatherReport(continent_list);
			continentObject.updateTiles(continent_list);
		});
		temp_button_id.addEventListener("click", () => {
			weather_info.updateArrow(temp_button_id.id);
			continent_list = Object.fromEntries(
				weather_info.sortContinents(
					cont_button_id,
					temp_button_id,
					continent_list
				)
			);
			let temperatureObject = new WeatherReport(continent_list);
			temperatureObject.updateTiles(continent_list);
		});
	}
}
class CurrentCity {
	constructor() {
		this.setProperties = function (selectedCity) {
			this.cityName = weather_data[selectedCity].cityName;
			this.dateAndTime = weather_data[selectedCity].dateAndTime;
			this.timeZone = weather_data[selectedCity].timeZone;
			this.temperature = weather_data[selectedCity].temperature;
			this.humidity = weather_data[selectedCity].humidity;
			this.precipitation = weather_data[selectedCity].precipitation;
		};
		this.getCityName = function () {
			return this.cityName;
		};
		this.getDateAndTime = function () {
			return this.dateAndTime;
		};
		this.getTimeZone = function () {
			return this.timeZone;
		};
		this.getTemperature = function () {
			return this.temperature;
		};
		this.getHumidity = function () {
			return this.humidity;
		};
		this.getPrecipitation = function () {
			return this.precipitation;
		};
		this.getNextFiveHrs = function () {
			return this.nextFiveHrs;
		};
	}
	/**
	 * Function to update data with nil and warning sign for invalid input
	 * This function changes text values to "NIL" and all images to warning image when user input is invalid
	 *
	 */
	updateNilValuesForInvalidInput() {
		document.getElementById("city-icon").src =
			"Assets/GeneralImages&Icons/warning.svg";
		document.getElementById("am-pic").src =
			"Assets/GeneralImages&Icons/warning.svg";
		let weather_icons = document.getElementsByClassName("weather-icon");
		let time_period = document.getElementsByClassName("time-period");
		let time_temperature = document.getElementsByClassName("time-temperature");
		for (let i = 0; i < 6; i++) {
			weather_icons[i].src = "Assets/GeneralImages&Icons/warning.svg";
			time_period[i].innerHTML = time_temperature[i].innerHTML = "NIL";
		}
		let error_time = document.getElementsByClassName("time");
		error_time[0].innerHTML = "NIL";
		document.getElementById("date").innerHTML =
			document.getElementById("temperature-celsius").innerHTML =
			document.getElementById("temperature-fahrenheit").innerHTML =
			document.getElementById("humidity").innerHTML =
			document.getElementById("precipitation").innerHTML =
				"NIL";
		clearInterval(topTimeInterval);
		alert("Invalid input");
	}
	/**
	 * Function to add zero to single digit values
	 * The function returns single digit numbers with 0 appended at the beginning
	 * addZero(9) returns "09"
	 *
	 * @param {number} digit a number
	 * @return {string} the digit with 0 at the beginning
	 */
	addZero(digit) {
		if (digit <= 9) {
			digit = "0" + digit;
		}
		return digit;
	}
	/**
	 * Function to update the City icon based on the selected city
	 * This function changes the city icon displayed beside input box based on the input given in the input box.
	 *
	 * @param {string} selectedCity The value selected in input box
	 * @return {void} Nothing
	 */
	updateCityIcon() {
		let icon_src = document.getElementById("city-icon");
		icon_src.src =
			"Assets/IconsForCities/" + this.getCityName().toLowerCase() + ".svg";
	}
	/**
	 * Function to update date based on the selected city
	 * This function uses methods of Date object to display date with the required format
	 *
	 * @param {Date object} selectedCity_date_time The date object with current date and time
	 * @return {void} Nothing
	 */
	updateDate() {
		const selectedCity_date_time = new Date(
			new Date().toLocaleString("en-US", {
				timeZone: this.getTimeZone(),
			})
		);
		const month = selectedCity_date_time.toLocaleString("default", {
			month: "short",
		});
		let d = this.addZero(selectedCity_date_time.getDate());
		document.getElementById("date").innerHTML =
			d + "-" + month + "-" + selectedCity_date_time.getFullYear();
	}
	/**
		 * Function to update time based on the selected city
		 * This function uses methods of Date object to display time as per the given format
		 * It runs at 1000 milliseconds interval to update time each second
		 * Contains a self invoked function to update timeline based on current time
		 *
		 * @param {string} selectedCity The value selected in input box
		 * @return {void} Nothing
		//  */
	updateTime() {
		clearInterval(topTimeInterval);
		function updateLiveTime(cityObject) {
			const timezone = cityObject.getTimeZone();
			const selectedCity_date_time = new Date(
				new Date().toLocaleString("en-US", {
					timeZone: timezone,
				})
			);
			const period_of_day = document.getElementById("am-pic");
			const currentCity_time = document.getElementsByClassName("time");

			if (selectedCity_date_time.getHours() < 12) {
				period_of_day.src = "./Assets/GeneralImages&Icons/amState.svg";
			} else {
				period_of_day.src = "./Assets/GeneralImages&Icons/pmState.svg";
			}
			let h = selectedCity_date_time.getHours();
			h = h > 12 ? h % 12 : h;
			h = h ? h : 12;
			h = cityObject.addZero(h);
			let m = cityObject.addZero(selectedCity_date_time.getMinutes());
			let s = cityObject.addZero(selectedCity_date_time.getSeconds());
			currentCity_time[0].innerHTML =
				h + ":" + m + ":" + "<small>" + s + "<small>";

			(function () {
				let time_period = document.getElementsByClassName("time-period");
				let hours = Number(selectedCity_date_time.getHours());
				let h;
				time_period[0].innerHTML = "NOW";
				for (let i = 1; i <= 5; i++) {
					h = (hours + i) % 24;
					if (h > 12) time_period[i].innerHTML = (h % 12) + " PM";
					else if (h == 12) {
						time_period[i].innerHTML = h + " PM";
					} else {
						h = h % 12 ? h : 12;
						time_period[i].innerHTML = h + " AM";
					}
				}
			})(); //self-invoking function which is executed if outer function is invoked.

			// This function updates the next 5 hours' time after retrieving it from json file.
		}
		setTimeout(updateLiveTime, 0, this);
		topTimeInterval = setInterval(updateLiveTime, 1000, this);
	}
	/**
	 * Function to update temperatures based on the selected city
	 * This function updates current temperature in Celsius and converts Celsius to Fahrenheit and displays both.
	 *
	 * @param {string} selectedCity The value selected in input box
	 * @return {Function()} - The returned function
	 *
	 * The returned function updates the temperature for next five hours.
	 */
	updateTemperature() {
		const tempertaureInC = document.getElementById("temperature-celsius");
		const tempertaureInF = document.getElementById("temperature-fahrenheit");
		const currentCity_temperature = this.getTemperature();
		tempertaureInC.innerHTML = currentCity_temperature;
		tempertaureInF.innerHTML = `${
			(parseInt(currentCity_temperature) * 1.8 + 32).toFixed(1) + "&deg;F"
		}`;
		return function () {
			const selectedCityTemperatures = this.nextFiveHrs;
			let time_temperature =
				document.getElementsByClassName("time-temperature");
			let weather_icon = document.getElementsByClassName("weather-icon");
			time_temperature[0].innerHTML = parseInt(currentCity_temperature);
			let temp;
			for (let i = 1; i <= 5; i++) {
				temp = selectedCityTemperatures[i - 1].split("°");
				time_temperature[i].innerHTML = parseInt(temp[0]);
			}
			for (let i = 0; i < 6; i++) {
				if (
					updateTemperatureIcon(
						time_temperature[i].innerHTML,
						Number.MIN_SAFE_INTEGER,
						18
					)
				)
					weather_icon[i].src = "Assets/WeatherIcons/rainyIconBlack.svg";
				else if (updateTemperatureIcon(time_temperature[i].innerHTML, 18, 23))
					weather_icon[i].src = "Assets/WeatherIcons/windyIcon.svg";
				else if (updateTemperatureIcon(time_temperature[i].innerHTML, 23, 30))
					weather_icon[i].src = "Assets/WeatherIcons/cloudyIcon.svg";
				else weather_icon[i].src = "Assets/WeatherIcons/sunnyIconBlack.svg";
			}
		}.bind(this);
		function updateTemperatureIcon(temperature, min, max) {
			if (temperature < max && temperature >= min) return true;
		}
	}
	/**
	 * Function to update current humidity and current precipitation based on the selected city
	 * This function fetches humidity and precipitation values from json file and displays it.
	 * @param {string} selectedCity The value selected in input box
	 * @return {void} Nothing
	 */
	updateHumidityAndPrecipitation() {
		const humidity = document.getElementById("humidity");
		const precipitation = document.getElementById("precipitation");
		humidity.innerHTML = this.getHumidity();
		precipitation.innerHTML = this.getPrecipitation();
	}
	/**
	 * This function is used to create card for a particular city with it's weather details.
	 * This function creates html elements to display name, temperature, date, time, humidity and precipitation of a city
	 * and assembles it as a card.
	 *
	 * @param {object} city The object with a particular city's weather data.
	 * @param {string} iconPath The path of icon to be displayed according to weather.
	 */
	createCityCard(iconPath) {
		let card_container = document.getElementById("card-container");
		let card = document.createElement("div");
		let backgroundImageURL =
			"Assets/IconsForCities/" + this.cityName.toLowerCase() + ".svg";
		let card_time = document.createElement("h4");
		let card_date = document.createElement("h4");
		card_date.className = "card-date";
		card_time.className = "card-time";
		card.className = "city-card";
		card.id = "city-card";
		card.style.backgroundImage = `url("${backgroundImageURL}")`;

		/**  A function that appends city name and temperature.
		 * This function creates HTML elements to display city name and temperature with icon.
		 * @return {Element} name_temp_cont The final div element that is to be appended to the card.
		 */
		const appendCityNameAndTemperature = (() => {
			let name_temp_cont = document.createElement("div");
			let city_name = document.createElement("h3");
			let temp_icon = document.createElement("img");
			let temp = document.createElement("h2");
			name_temp_cont.className = "name-temp-cont";
			city_name.className = "city-name";
			city_name.append(this.getCityName());
			temp_icon.className = "temp-icon";
			temp_icon.src = iconPath;
			temp.className = "temp";
			temp.append(this.getTemperature());
			name_temp_cont.appendChild(city_name);
			name_temp_cont.appendChild(temp_icon);
			name_temp_cont.appendChild(temp);
			return name_temp_cont;
		}).bind(this);

		/** A function that appends current city time to the card.
		 * This function creates HTML element to display the current city time.
		 * @param {Object} selectedCity_date_time The date object of the current city object.
		 * @return {Element} card_time The final div element that is to be appended to the card.
		 */
		const appendCardTime = (() => {
			const selectedCity_date_time = new Date(
				new Date().toLocaleString("en-US", {
					timeZone: this.getTimeZone(),
				})
			);

			card_time.innerHTML = this.updateCardTimeFormat(selectedCity_date_time);
			return card_time;
		}).bind(this);

		/** A function that appends current city date to the card.
		 * This function creates HTML element to display the current city date.
		 * @param {Object} selectedCity_date_time The date object of the current city object.
		 * @return {Element} card_date The final div element that is to be appended to the card.
		 */
		const appendCardDate = (() => {
			const selectedCity_date_time = new Date(
				new Date().toLocaleString("en-US", {
					timeZone: this.getTimeZone(),
				})
			);

			card_date.innerHTML = `${this.addZero(
				selectedCity_date_time.getDate()
			)}-${selectedCity_date_time.toLocaleString("default", {
				month: "short",
			})}-${selectedCity_date_time.getFullYear()}`;
			return card_date;
		}).bind(this);
		setInterval(appendCardTime, 1000);
		setInterval(appendCardDate, 1000);
		setTimeout(appendCardTime, 0);
		setTimeout(appendCardDate, 0);
		/** A function that appends current city humidity to the card.
		 * This functions creates a HTML container to display humidity icon and current humidity of the city.
		 * @return {Element} weather_info_humidity The final div element that is to be appended to the card.
		 */
		const appendHumidity = (() => {
			let weather_info_humidity = document.createElement("div");
			let humidity_icon = document.createElement("img");
			let humidity = document.createElement("span");
			weather_info_humidity.className = "weather-info";
			humidity_icon.className = "weather-info-icon";
			humidity.className = "weather-info-text";
			humidity.append(this.getHumidity());
			humidity_icon.src = "Assets/WeatherIcons/humidityIcon.svg";
			weather_info_humidity.appendChild(humidity_icon);
			weather_info_humidity.appendChild(humidity);
			return weather_info_humidity;
		}).bind(this);

		/** A function that appends current city temperature to the card.
		 * This function creates a HTML container to display precipitation icon and current precipitation of the city.
		 * @return {Element} weather_info_precipitation The final div element that is to be appended to the card.
		 */
		const appendPrecipitation = (() => {
			let weather_info_precipitation = document.createElement("div");
			let precipitation_icon = document.createElement("img");
			let prec = document.createElement("span");
			weather_info_precipitation.className = "weather-info";
			precipitation_icon.className = "weather-info-icon";
			prec.className = "weather-info-text";
			prec.append(this.getPrecipitation());
			precipitation_icon.src = "Assets/WeatherIcons/precipitationIcon.svg";
			weather_info_precipitation.appendChild(precipitation_icon);
			weather_info_precipitation.appendChild(prec);
			return weather_info_precipitation;
		}).bind(this);

		//append the elements to the card.
		card.appendChild(appendCityNameAndTemperature());
		card.appendChild(card_time);
		card.appendChild(card_date);
		card.appendChild(appendHumidity());
		card.appendChild(appendPrecipitation());
		card_container.appendChild(card);
	}
	/**
	 * This function converts the current time of a city from railway timing standards to am/pm standard and updates it in the card.
	 *
	 * @param {Object} selectedCity_date_time The date object of the particular city
	 * @return {string} The time to be displayed after conversion.
	 */
	updateCardTimeFormat(selectedCity_date_time) {
		let h, m, am;
		let time;
		h = selectedCity_date_time.getHours();
		m = selectedCity_date_time.getMinutes();
		h = h > 12 ? h - 12 : h;
		h = h ? h : 12;
		if (selectedCity_date_time.getHours() >= 12) am = "PM";
		else am = "AM";
		time = `${this.addZero(h)}:${this.addZero(m)} ${am}`;
		return time;
	}
}
class CityTile extends CurrentCity {
	constructor() {
		super();
	}
	/**
	 * This function creates a tile for a particular city.
	 * The tile is created using dynamic creation of html elements.
	 * The tile displays continent name, city's temperature, city's name, city's time, and city's humidity.
	 *
	 * @param {Object} city The key and value pairs of an individual city object.
	 */
	createTilesInBottomContainer() {
		let tile_container = document.getElementById("tile-container");
		let tile = document.createElement("div");
		let city_time = document.createElement("p");
		/**
		 * This function appends the continent name to the created tile
		 * @return {Element} continent_name The name of the continent.
		 *  */
		const appendContinentName = (() => {
			let continent_name = document.createElement("p");
			continent_name.append(this.getTimeZone().split("/")[0]);
			continent_name.className = "continent-name";
			return continent_name;
		}).bind(this);

		/**
		 * This function appends the current temperature of the city to the created tile.
		 * @return {Element} tile_temp The current temperature of the city
		 */
		const appendTemperatureInTile = (() => {
			let tile_temp = document.createElement("h2");
			tile_temp.append(this.getTemperature());
			tile_temp.className = "tile-temp";
			return tile_temp;
		}).bind(this);

		/**
		 * This function appends the current humidity of the city to the created tile.
		 * @return {Element} tile_humidity The current humidity of the city
		 */
		const appendHumidityInTile = (() => {
			let tile_humidity = document.createElement("p");
			let humidity_icon = document.createElement("img");
			let humidity = document.createElement("span");
			humidity.append(this.getHumidity());
			humidity_icon.src = "Assets/WeatherIcons/humidityIcon.svg";
			humidity_icon.className = "weather-info-icon";
			tile_humidity.className = "tile-humidity";
			tile_humidity.appendChild(humidity_icon);
			tile_humidity.appendChild(humidity);
			return tile_humidity;
		}).bind(this);

		/**
		 * This function updates the live time of the city in tile.
		 */
		const updateLiveTimeInTile = (() => {
			const selectedCity_date_time = new Date(
				new Date().toLocaleString("en-US", {
					timeZone: this.getTimeZone(),
				})
			);
			city_time.innerHTML = `${this.getCityName()}, ${this.updateCardTimeFormat(
				selectedCity_date_time
			)}`;
		}).bind(this);
		setInterval(updateLiveTimeInTile, 1000);
		setTimeout(updateLiveTimeInTile, 0);

		city_time.className = "city-time";
		tile.className = "tile";
		tile.appendChild(appendContinentName());
		tile.appendChild(appendTemperatureInTile());
		tile.appendChild(city_time);
		tile.appendChild(appendHumidityInTile());
		tile_container.appendChild(tile);
	}
}
let topTimeInterval;
let weather_info = new WeatherReport(weather_data);
function loadWeatherApp() {
	document
		.getElementById("city")
		.addEventListener("change", weather_info.updateTopSectionData);

	weather_info.importCity();
	weather_info.updateTopSectionData();
	weather_info.updateMiddleSection();
	weather_info.updateBottomSection();
	setInterval(weather_info.displayButton, 1000);
	setTimeout(weather_info.displayButton, 0);
}
