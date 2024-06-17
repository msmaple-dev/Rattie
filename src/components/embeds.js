const { EmbedBuilder, Embed} = require('discord.js');
const { toProperCase, parseLinebreaks, isValidColor, isValidUrl} = require('../functions/string_utils');
const {monster_color} = require("./constants");

function statusEmbed(name, effect, severity, color, identifier = '', forcedSeverity = '') {
	let embed = new EmbedBuilder()
		.setTitle(name + `${severity ? ` (${toProperCase(severity)})` : ''}`)
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
		embed.addFields(...descFields);
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

function wikiListEmbed(wikis, currentPage, wikiCount){
	let embed = new EmbedBuilder().setTitle(`List of Wikis (${currentPage*25+1}-${Math.min((currentPage+1)*25, wikiCount)}/${wikiCount})`)
	let wikiList = wikis.map((wiki, index) => `${(index+1)+((currentPage)*25)}. ${wiki.warlockName ? `${wiki.name} - ${wiki.warlockName}` : wiki.name}`).join('\n')
	embed.setDescription(wikiList);
	embed.setColor('#5e4415')
	return embed;
}

function monsterEmbed(monster){
	let {id, name, description, scale, mechanics, basicAction, size} = monster;
	let embed = new EmbedBuilder().setTitle(`${name} (${id})`).setDescription(`*${description}*`).setColor(monster_color);
	let fields = [
		(scale !== null && { name: `Scale`, value: `${scale}`, inline: true }),
		(size !== null && { name: `Size`, value: `${size}`, inline: true }),
		(mechanics !== null && { name: `Mechanics`, value: mechanics}),
		(basicAction !== null && { name: `Instinct`, value: basicAction }),
	].filter(a => a);
	embed.addFields(...fields)
	return embed
}

function lootEmbed(monsterId, lootString){
	return new EmbedBuilder().setTitle(`Looting Monster: ${toProperCase(monsterId)}`).setDescription(lootString.replaceAll(/\*/gm, toProperCase(monsterId))).setColor(monster_color)
}

function monsterAttackedEmbed(monster, damage, currentDamage, attackRoll, monsterAC){
	let embed = new EmbedBuilder().setTitle(attackRoll ? `Attacking ${monster.name} for ${damage} damage:` : `Applying ${damage} damage to ${monster.name}:`)
	if(attackRoll){
		embed.setDescription(`(${attackRoll}) vs (${monsterAC}): ${attackRoll >= monsterAC ? `Hit! ${damage} Dealt (${currentDamage} Total)` : `Missed by ${attackRoll - monsterAC}`}`)
	} else {
		embed.setDescription(`${damage} Damage Dealt (${currentDamage} Total)`)
	}
	embed.setColor(monster_color)
	return embed;
}

function monsterDefeatedEmbed(users){
	return new EmbedBuilder().setTitle(`Monster Down!`).setDescription(`The following users must do \`\`/monster loot\`\` before init will close:${users.map(usr => `<@${usr}>`).join(", ")}`).setColor(monster_color);
}

module.exports = { statusEmbed, tarotEmbed, wikiEmbed, wikiListEmbed, monsterEmbed, lootEmbed, monsterAttackedEmbed, monsterDefeatedEmbed };