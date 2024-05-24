const { EmbedBuilder } = require('discord.js');

String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};

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

function wikiEmbed(wiki) {
	let {
		name,
		warlockName,
		appearance,
		quote,
		scale,
		age,
		icon,
		image,
		source,
		about,
		abilities,
		faction,
		color,
		pronouns,
	} = wiki;

	let embed = new EmbedBuilder().setTitle(warlockName || name);
	let descriptionText = `${quote ? `*${parseLinebreaks(quote)}*\n` : ''}\n`;
	let footerText = `${!isValidColor(color) ? `Invalid Color: ${color}` : ''}`;
	let headerFields = [
		(age && { name: `Age`, value: age, inline: true }),
		(scale && { name: `Scale`, value: scale, inline: true }),
		(faction && { name: `Faction`, value: faction, inline: true }),
		(pronouns && { name: `Pronouns`, value: pronouns, inline: true }),
	].filter(a => a);
	let descFields = [
		(about && { name: `About ${warlockName || name}`, value: `${parseLinebreaks(about)}` }),
		(abilities && { name: 'Abilities', value: parseLinebreaks(abilities) }),
		((appearance || source) && {
			name: 'Appearance',
			value: (appearance ? parseLinebreaks(appearance) + '\n' : '') + (source ? (isValidUrl(source) ? `\n*[Image Source](${source})*` : `\nImage Source: ${source}`) : ''),
		}),
	].filter(a => a);

	if (headerFields) {
		embed.addFields(...headerFields);
	}
	if (descFields) {
		embed.addFields(descFields);
	}

	if (icon) {
		embed.setThumbnail(icon);
	}
	if (color && isValidColor(color)) {
		embed.setColor(color);
	}
	if (descriptionText) {
		embed.setDescription(descriptionText);
	}

	if (footerText) {
		embed.setFooter({ text: footerText });
	}
	if (image) {
		embed.setImage(image);
	}
	return embed;
}

module.exports = { statusEmbed, tarotEmbed, wikiEmbed };