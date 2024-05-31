const { EmbedBuilder } = require('discord.js');
const { toProperCase } = require('../functions/string_utils');

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

function statusEmbed(name, effect, severity, color, identifier = '', forcedSeverity = '') {
	let embed = new EmbedBuilder()
		.setTitle(name + ` (${toProperCase(severity)})`)
		.setDescription(parseLinebreaks(effect));
	let validColor = isValidColor(color);
	if (forcedSeverity || identifier || !(validColor)) {
		let embedText = [
			(identifier ? `Rolling for sub-user: ${identifier}` : ''),
			(forcedSeverity ? `Using Severity: ${toProperCase(forcedSeverity)}` : ''),
			(!(validColor) ? `Invalid Color: ${color}` : '')
		].filter(a=>a).join(', ');
		embed.setFooter({ text: embedText });
	}
	if (color && validColor) {
		embed.setColor(color);
	}
	return embed;
}

function tarotEmbed(name, originalTarot, majorTarot, upright, reverse, description, explanation, forcedTier, specificCard) {
	let footerText = [
		(forcedTier !== null && `Forced Tier: ${forcedTier ? 'Major' : 'Minor'}`),
		(specificCard !== null && `Drawing Specific Card: ${specificCard}`),
	].filter(a => a)

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
	if (footerText?.length > 0) {
		embed.setFooter({ text: footerText.join(', ') });
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
		scent,
		renown,
	} = wiki;

	let embed = new EmbedBuilder().setTitle((warlockName || name) + (pronouns ? ` (${pronouns})` : ''));
	let descriptionText = `${quote ? `*${parseLinebreaks(quote)}*\n` : ''}\n`;
	let footerText = `${!isValidColor(color) ? `Invalid Color: ${color}` : ''}`;
	let headerFields = [
		(age !== null && { name: `Age`, value: age, inline: true }),
		(scale !== null && { name: `Scale`, value: scale, inline: true }),
		(faction !== null && { name: `Faction`, value: faction, inline: true }),
		(renown !== null && { name: `Renown`, value: renown, inline: true }),
	].filter(a => a);
	let descFields = [
		(scent !== null && { name: `Warlock Scent`, value: scent }),
		(about !== null && { name: `About ${warlockName || name}`, value: `${parseLinebreaks(about)}` }),
		(abilities !== null && { name: 'Abilities', value: parseLinebreaks(abilities) }),
		((appearance || source) && {
			name: 'Appearance',
			value: (appearance ? parseLinebreaks(appearance) + '\n' : '') + (source ? (isValidUrl(source) ? `\n*[Image Source](${source})*` : `\n*Image Source: ${source}*`) : ''),
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