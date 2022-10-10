//Import necessary modules for server creation
var weatherResult = [];
var startTime = new Date(),
	dayCheck = 3600000;
var path = require("path");
const express = require("express");
const bp = require("body-parser");
const app = express();
const port = process.env.port || 8888;
const { fork } = require("child_process");

// Render static files such as images,CSS and JS from "files" folder.
app.use(express.static("files"));

// Render HTML file when "/index.html" is requested in URL.
app.use("/index(.html)?", express.static("files"));

// Transform JSON input into Javascript-accessible variables
app.use(bp.json());

/* Transform URL encoded request into Javascript-accessible variables under request.body
 * body-parser's extended property is set to false to make sure it only accepts strings and arrays.
 */
app.use(bp.urlencoded({ extended: false }));

// Load HTML file when server is loaded without any request.
app.get("/", (request, response) => {
	response.sendFile("index.html");
});

/* Call API to get Weather Details of all the cities. The weather details of
 * all the cities are returned in JSON format.
 * If the data is not fetched , then it returns an error message.
 */
app.get("/all-timezone-cities", (request, response) => {
	let currentTime = new Date();
	let child_process = fork("./files/Scripts/child_process.js");
	if (currentTime - startTime > dayCheck) {
		startTime = new Date();
		child_process.send({ messageContent: "GetWeatherData", args: null });
		child_process.on("message", (data) => {
			weatherResult = data;
			response.json(weatherResult);
		});
	} else if (weatherResult.length === 0) {
		child_process.send({ messageContent: "GetWeatherData", args: null });
		child_process.on("message", (data) => {
			weatherResult = data;
			response.json(weatherResult);
		});
	} else {
		response.json(weatherResult);
	}
});

/* Call API to get next hours' temperature of a particular city.
 * The next n hours temperature of the city present in the body of the request is returned in JSON format.
 * If the data is not fetched , then error message is returned.
 */
app.post("/hourly-forecast", (request, response) => {
	let cityDTN = request.body.city_Date_Time_Name;
	let hours = request.body.hours;
	let child_process = fork("./files/Scripts/child_process.js", []);
	if (cityDTN && hours) {
		child_process.send({
			messageContent: "GetHourlyForecast",
			args: {
				cityDTN: cityDTN,
				hours: hours,
				weatherResult: weatherResult,
			},
		});
		child_process.on("message", (data) => {
			response.json(data);
		});
	} else {
		response.status(404);
		response.json({
			Error: "Not a valid Endpoint. Please check API Doc",
		});
	}
});

/* Call API to return city name,date and time on request. The returned values are used to call the API
 * to get next hours' temperature of the requested city. URL of this request is changed to "/city" since "/"
 * is used to load html file.
 * If the data is not fetched, then it returns an error message.
 */
app.get("/city", (request, response) => {
	const city = request.query.city;
	let child_process = fork("./files/Scripts/child_process.js");
	if (city) {
		child_process.send({
			messageContent: "GetTimeForCity",
			args: { city: city },
		});
		child_process.on("message", (data) => response.json(data));
	} else {
		response.status(404);
		response.json({
			Error: "Not a valid Endpoint. Please check API Doc",
		});
	}
});
app.listen(port);
