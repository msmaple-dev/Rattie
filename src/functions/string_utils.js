const camelCase = require("lodash.camelcase");

function toProperCase(string) {
	return string.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
}

function parseLinebreaks(text) {
	if (text) {
		return text.replaceAll(/\\n/gm, '\n');
	}
	else {
		return text;
	}
}

function isValidUrl(text) {
	// Credit to Stack Exchange user Matthew O'Riordan for this pattern (https://stackoverflow.com/a/8234912)
	let pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
	return text && pattern.test(text);
}

function isValidColor(color) {
	let validShortcuts = ['Default', 'Aqua', 'DarkAqua', 'Green', 'DarkGreen', 'Blue', 'DarkBlue', 'Purple', 'DarkPurple', 'LuminousVividPink', 'DarkVividPink', 'Gold', 'DarkGold', 'Orange', 'DarkOrange', 'Red', 'DarkRed', 'Grey', 'DarkGrey', 'DarkerGrey', 'LightGrey', 'Navy', 'DarkNavy', 'Yellow'];
	return (color && (validShortcuts.indexOf(color) > -1 || /^#[0-9A-F]{6}$/i.test(color)));
}

// Credit to user Robin Weiruch on stack exchange: https://stackoverflow.com/a/50620653
function camelizeKeys(obj) {
	if (Array.isArray(obj)) {
		return obj.map(v => camelizeKeys(v));
	} else if (obj != null && obj.constructor === Object) {
		return Object.keys(obj).reduce(
			(result, key) => ({
				...result,
				[camelCase(key)]: camelizeKeys(obj[key]),
			}),
			{},
		);
	}
	return obj;
}

module.exports = { toProperCase, parseLinebreaks, isValidUrl, isValidColor, camelizeKeys }