const { EmbedBuilder } = require('discord.js');

String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};

function isValidColor(color) {
	let validShortcuts = ['Default', 'Aqua', 'DarkAqua', 'Green', 'DarkGreen', 'Blue', 'DarkBlue', 'Purple', 'DarkPurple', 'LuminousVividPink', 'DarkVividPink', 'Gold', 'DarkGold', 'Orange', 'DarkOrange', 'Red', 'DarkRed', 'Grey', 'DarkGrey', 'DarkerGrey', 'LightGrey', 'Navy', 'DarkNavy', 'Yellow'];
	return (color && (validShortcuts.indexOf(color) > -1 || /^#[0-9A-F]{6}$/i.test(color)));
}

function statusEmbed(name, effect, severity, color, forcedSeverity = '') {
	let embed = new EmbedBuilder()
		.setTitle(name + ` (${severity.toProperCase()})`)
		.setDescription(effect);
	let validColor = isValidColor(color);
	if (forcedSeverity || !(validColor)) {
		embed.setFooter({ text: `${forcedSeverity ? `Using Severity: ${forcedSeverity.toProperCase()}, ` : ''}${!(validColor) ? `Invalid Color: ${color}` : ''}` });
	}
	if (color && validColor) {
		embed.setColor(color);
	}
	return embed;
}

function tarotEmbed(name, originalTarot, majorTarot, upright, reverse, description, explanation, forcedTier) {
	let embed = new EmbedBuilder()
		.setColor(majorTarot ? '#ff9441' : '#5e4415')
		.setTitle(name + ` (${majorTarot ? `#${originalTarot}` : originalTarot})`);
	if (majorTarot) {
		embed.setDescription(`*${majorTarot}*`);
	}
	if (description) {
		embed.addFields({ name: 'Appearance', description });
	}
	embed.addFields(
		{ name: 'Upright Keywords', value: upright },
		{ name: 'Reversed Keywords', value: reverse },
	);
	if (explanation) {
		embed.addFields({ name: 'Explanation', explanation });
	}
	if (forcedTier !== null) {
		embed.setFooter({ text: `Forced Tier: ${forcedTier ? 'Major' : 'Minor'}` });
	}
	return embed;
}

module.exports = { statusEmbed, tarotEmbed };