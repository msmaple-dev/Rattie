function timeFromString(timeString){
	const timeStart = Date.now();

	const timeYears = timeString.match(/\d+(?=y)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
	const timeWeeks = timeString.match(/\d+(?=w)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
	const timeDays = timeString.match(/\d+(?=d)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
	const timeHours = timeString.match(/\d+(?=h)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
	const timeMinutes = timeString.match(/\d+(?=m)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;

	return timeStart + (
		((((((timeYears * 365) + (timeWeeks * 7) + timeDays) * 24) + timeHours) * 60) + timeMinutes) * 60000
	)
}

module.exports = timeFromString