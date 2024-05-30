function toProperCase(string) {
	return string.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
}

module.exports = { toProperCase }