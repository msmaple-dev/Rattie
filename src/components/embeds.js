const { EmbedBuilder } = require('discord.js');
const { toProperCase, parseLinebreaks, isValidColor, isValidUrl} = require('../functions/string_utils');
const {monster_color} = require("./constants");
const { rollResultsToString } = require('../functions/roll_utils');

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
	for(let [key, value] of Object.entries(wiki)){
		if(value?.toString().length >= 1024){
			return new EmbedBuilder().setTitle(`The field ${key} is too long (Length: ${value.toString().length} >= 1024)`)
		}
	}
	let totalLength = Object.values(wiki).reduce((sum, a) => (sum + (a?.length || 0)), 0)
	if(totalLength > 5500){
		return new EmbedBuilder().setTitle(`The wiki's total length is too long (Total Length: ${totalLength} >= 5500, Field Lengths: ${Object.entries(wiki).filter(entry => entry[1]).map((entry) => `${toProperCase(entry[0])}: ${entry[1].length}`).join(", ")})`)
	}
	let usedSource = (source ? (isValidUrl(source) ? `\n*[Image Source](${source})*` : `\n*Image Source: ${source}*`) : '')
	let usedAppearance = (appearance ? parseLinebreaks(appearance) + '\n' : '') + usedSource
	if(usedAppearance && usedAppearance.toString().length > 1024){
		return new EmbedBuilder().setTitle(`Your appearance section is too long${source ? ' when combined with your image source field ': ''} (Appearance Length: ${appearance.toString().length} >= ${1024 - ((usedSource && usedSource?.toString()?.length) || 0)})`)
	}
	let embed = new EmbedBuilder().setTitle((warlockName || name) + (pronouns ? ` (${pronouns})` : ''));
	let descriptionText = `${quote ? `*${parseLinebreaks(quote)}*\n` : ''}\n`;
	let footerText = `${!isValidColor(color) ? `Invalid Color: ${color}` : ''}${image && !isValidUrl(image) ? `Invalid Image Link: ${image}` : ''}`;
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

	if (headerFields && headerFields?.length) {
		embed.addFields(...headerFields);
	}
	if (descFields && descFields?.length) {
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
	if (image && isValidUrl(image)) {
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
	let {id, name, description, scale, mechanics, basicAction, size, damageThreshold, armorClass, curseDie, isPreview, isRetired} = monster;
	const midpoint = damageThreshold && damageThreshold?.length && Math.floor(damageThreshold?.length / 2); // 2.
	const medianHP = midpoint ? (damageThreshold.length % 2 === 1 ?	damageThreshold[midpoint] :	(damageThreshold[midpoint - 1] + damageThreshold[midpoint]) / 2) : (damageThreshold || null);
	let embed = new EmbedBuilder().setTitle(`${name} (${id}) - Scale ${scale}`).setDescription(`*${isPreview ? "???\n[This monster is not yet available to fight.]" : description}${isRetired ? "\n\n [This monster cannot be fought without performing a Summoning Circle ritual]" : ""}*`).setColor(monster_color);
	let fields = [
		(size !== null && { name: `Size`, value: `${size}`, inline: true }),
		(medianHP !== null && { name: `Median HP`, value: `${medianHP}`, inline: true }),
		(armorClass !== null && { name: `AC Roll`, value: `${Array.isArray(armorClass) ? armorClass.map(rollCode => rollCode.join("d")).join("+") + "+1d" + (curseDie || 5) : armorClass + "+1d" + (curseDie || 5)}`, inline: true }),
		(mechanics !== null && { name: `Mechanics`, value: mechanics}),
		(basicAction !== null && { name: `Instinct`, value: basicAction }),
	].filter(a => a);
	embed.addFields(...fields)
	return embed
}

function lootEmbed(monsterId, lootString){
	return new EmbedBuilder().setTitle(`Looting Monster: ${toProperCase(monsterId)}`).setDescription(lootString.replaceAll(/\*/gm, toProperCase(monsterId))).setColor(monster_color)
}

function monsterAttackedEmbed(monster, damage, currentDamage, attackRoll, baseAC, monsterCurseDie, monsterCurseDieSize, flatMod, monsterAC){
	let embed = new EmbedBuilder().setTitle(attackRoll ? `Attacking ${monster.name} for ${damage} damage:` : `Applying ${damage} damage to ${monster.name}:`)
	if(attackRoll){
		let baseRollDesc = baseAC;
		if(Array.isArray(monster.armorClass)){
			baseRollDesc = ``
			for (let i = 0; i < monster.armorClass.length; i++) {
				baseRollDesc += `${monster.armorClass[i].join("d")}${baseAC.map((subArray, index) => rollResultsToString(subArray, index, monster.armorClass[i]))}`
			}
		}
		let rollDescription = `[${baseRollDesc}+1d${monsterCurseDieSize}(${monsterCurseDie})${flatMod ? (flatMod > 0 ? `+${flatMod}` : flatMod) : ''}]`
		embed.setDescription(`${attackRoll >= monsterAC ? `**${attackRoll}**` : attackRoll} vs ${monsterAC > attackRoll ? `**${monsterAC}**`: monsterAC} ${rollDescription}: ${attackRoll >= monsterAC ? `**Hit!** ${damage} Dealt (${currentDamage} Total)` : `Missed by ${attackRoll - monsterAC}`}`)
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