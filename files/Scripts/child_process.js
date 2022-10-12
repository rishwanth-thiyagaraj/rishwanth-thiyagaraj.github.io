// Import module containing the data computation for weather forecasting.
const wd = require("rishwanth_weather-data");
const fs = require("fs");

/*The parent process sends messages to this child process according to the request in the server.
 * Execute methods imported from the package based on the message from parent process.
 * Return data according to the method that was executed.
 */
process.on("message", (msg) => {
	try {
		if (msg.messageContent == "GetWeatherData") {
			process.send(wd.allTimeZones());
			process.exit();
		} else if (msg.messageContent == "GetHourlyForecast") {
			try {
				// Check if arguments are present in message body
				if (!msg.args) {
					throw new Error(
						"Argument key in message body of request to get hourly-forecast of a city missing!(/hourly-forecast)"
					);
				} else if (
					/* Check if all the arguments required to retrieve data
					 * from server are present in args key of message body
					 */
					!msg.args.cityDTN ||
					!msg.args.hours ||
					!msg.args.weatherResult
				) {
					throw new Error(
						"One or many argument(s) missing in message of request to get hourly-forecast of a city!(/hourly-forecast)"
					);
				} else if (
					msg.args.cityDTN &&
					msg.args.hours &&
					msg.args.weatherResult
				) {
					process.send(
						wd.nextNhoursWeather(
							msg.args.cityDTN,
							msg.args.hours,
							msg.args.weatherResult
						)
					);
					process.exit();
				}
			} catch (error) {
				//Logs the caught errors in logger.txt file for reference and debugging.
				let date = new Date();
				let errorMessage = "\n" + date.toDateString() + " " + error.message;
				fs.appendFile("logger.txt", errorMessage, function () {
					console.log(errorMessage);
				});
			}
		} else if (msg.messageContent == "GetTimeForCity") {
			try {
				// Check if arguments are present in message body
				if (!msg.args) {
					throw new Error(
						"Argument key in message body of request to get date and time data of one city is missing!(/city)"
					);
				} else if (!msg.args.city) {
					/* Check if all the arguments required to retrieve data
					 * from server are present in args key of message body
					 */
					throw new Error(
						"Argument missing in message body of request to get date and time data of one city!(/city)"
					);
				} else {
					process.send({
						messageContent: "Success",
						body: wd.timeForOneCity(msg.args.city),
					});
					process.exit();
				}
			} catch (error) {
				//Send message as "Error" to make server respond with error message.
				process.send({ messageContent: "Error", body: error.message });
				process.exit();
			}
		} else {
			throw new Error("Invalid Request");
		}
	} catch (error) {
		//Logs the caught errors in logger.txt file for reference and debugging.
		const date = new Date();
		let errorMessage = "\n" + date.toDateString() + " " + error.message;
		fs.appendFile("logger.txt", errorMessage, function () {
			console.log(errorMessage);
		});
	}
});
