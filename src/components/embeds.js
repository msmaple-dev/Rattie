const { EmbedBuilder } = require('discord.js');

String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};

function statusEmbed(name, effect, severity, color, forcedSeverity = '') {
	let embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(name + ` (${severity.toProperCase()})`)
		.setDescription(effect);
	if (forcedSeverity) {
		embed.setFooter({ text: `Using Severity: ${forcedSeverity.toProperCase()}` });
	}
	return embed;
}

module.exports = { statusEmbed };