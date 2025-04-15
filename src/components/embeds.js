const { EmbedBuilder } = require('discord.js');
const { toProperCase, parseLinebreaks, isValidColor, isValidUrl, underlineText, boldText } = require('../functions/string_utils');
const { monster_color } = require('./constants');
const { rollResultsToString } = require('../functions/roll_utils');
const { getRaidMonster } = require('../functions/raid_utils');

function statusEmbed(name, effect, severity, color, identifier = '', forcedSeverity = '') {
	const embed = new EmbedBuilder()
		.setTitle(name + `${severity ? ` (${toProperCase(severity)})` : ''}`)
		.setDescription(parseLinebreaks(effect));
	const validColor = isValidColor(color);
	if (forcedSeverity || identifier || !(validColor)) {
		const embedText = [
			(identifier ? `Rolling for sub-user: ${identifier}` : ''),
			(forcedSeverity ? `Using Severity: ${toProperCase(forcedSeverity)}` : ''),
			(!(validColor) ? `Invalid Color: ${color}` : ''),
		].filter(a => a).join(', ');
		embed.setFooter({ text: embedText });
	}
	if (color && validColor) {
		embed.setColor(color);
	}
	return embed;
}

function tarotEmbed(name, originalTarot, majorTarot, upright, reverse, description, explanation, forcedTier, specificCard) {
	const footerText = [
		(forcedTier !== null && `Forced Tier: ${forcedTier ? 'Major' : 'Minor'}`),
		(specificCard !== null && `Drawing Specific Card: ${specificCard}`),
	].filter(a => a);

	const embed = new EmbedBuilder()
		.setColor(majorTarot ? '#ff9441' : '#5e4415')
		.setTitle(name + ` (${majorTarot ? `#${originalTarot}` : originalTarot})`);
	if (majorTarot) {
		embed.setDescription(`*${majorTarot}*`);
	}
	if (description) {
		embed.addFields({ name: 'Appearance', value: description });
	}
	embed.addFields(
		{ name: 'Upright Keywords', value: upright },
		{ name: 'Reversed Keywords', value: reverse },
	);
	if (explanation) {
		embed.addFields({ name: 'Explanation', value: explanation });
	}
	if (footerText?.length > 0) {
		embed.setFooter({ text: footerText.join(', ') });
	}
	return embed;
}

function wikiEmbed(wiki) {
	const {
		name,
		warlockName,
		appearance,
		pneumaAppearance,
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
		showcaseUses,
		showcaseEnabled,
	} = wiki;
	for (const [key, value] of Object.entries(wiki)) {
		if (value?.toString().length >= 1024) {
			return new EmbedBuilder().setTitle(`The field ${key} is too long (Length: ${value.toString().length} >= 1024)`);
		}
	}
	const totalLength = Object.values(wiki).reduce((sum, a) => (sum + (a?.length || 0)), 0);
	if (totalLength > 5500) {
		return new EmbedBuilder().setTitle(`The wiki's total length is too long (Total Length: ${totalLength} >= 5500, Field Lengths: ${Object.entries(wiki).filter(entry => entry[1]).map((entry) => `${toProperCase(entry[0])}: ${entry[1].length}`).join(', ')})`);
	}
	const usedSource = (source ? (isValidUrl(source) ? `\n*[Image Source](${source})*` : `\n*Image Source: ${source}*`) : '');
	const usedAppearance = (appearance ? parseLinebreaks(appearance) + '\n' : '') + usedSource;
	if (usedAppearance && usedAppearance.toString().length > 1024) {
		return new EmbedBuilder().setTitle(`Your appearance section is too long${source ? ' when combined with your image source field ' : ''} (Appearance Length: ${appearance.toString().length} >= ${1024 - ((usedSource && usedSource?.toString()?.length) || 0)})`);
	}
	const embed = new EmbedBuilder().setTitle((warlockName || name) + (pronouns ? ` (${pronouns})` : ''));
	const descriptionText = `${quote ? `*${parseLinebreaks(quote)}*\n` : ''}\n`;
	const footerElements = [showcaseEnabled ? 'Showcase Enabled' : 'Showcase Disabled', `Showcase Uses: ${showcaseUses || 0}`, !isValidColor(color) ? `Invalid Color: ${color}` : '', image && !isValidUrl(image) ? `Invalid Image Link: ${image}` : ''];
	const footerText = footerElements.filter(e => e?.length > 0).join(' | ');
	const headerFields = [
		(age !== null && { name: 'Age', value: age, inline: true }),
		((scale !== null || renown !== null) && { name: `${scale !== null ? 'Scale' : ''}${scale !== null && renown !== null ? ' / ' : ''}${renown !== null ? 'Renown' : ''}`, value: [scale, renown].join(' / '), inline: true }),
		(faction !== null && { name: 'Faction', value: faction, inline: true }),
	].filter(a => a);
	const descFields = [
		(scent !== null && { name: 'Warlock Scent', value: scent }),
		(pneumaAppearance !== null && { name: 'Pneuma Appearance', value: pneumaAppearance }),
		(about !== null && { name: `About ${warlockName || name}`, value: `${parseLinebreaks(about)}` }),
		((appearance || source) && {
			name: 'Appearance',
			value: (appearance ? parseLinebreaks(appearance) + '\n' : '') + (source ? (isValidUrl(source) ? `\n*[Image Source](${source})*` : `\n*Image Source: ${source}*`) : ''),
		}),
		(abilities !== null && { name: 'Abilities', value: parseLinebreaks(abilities) }),
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

function wikiListEmbed(wikis, currentPage, wikiCount, selectLimit) {
	const embed = new EmbedBuilder().setTitle(`List of Wikis (${currentPage * selectLimit + 1}-${Math.min((currentPage + 1) * selectLimit, wikiCount)}/${wikiCount})`);
	const wikiList = wikis.map((wiki, index) => `${(index + 1) + ((currentPage) * selectLimit)}. ${wiki.warlockName ? `${wiki.name} - ${wiki.warlockName}` : wiki.name}`).join('\n');
	embed.setDescription(wikiList);
	embed.setColor('#5e4415');
	return embed;
}

function monsterEmbed(monster) {
	const { id, name, description, scale, mechanics, basicAction, size, enrage, enrageThreshold, stun, stunThreshold, damageThreshold, armorClass, curseDie, isPreview, isRetired } = monster;
	const midpoint = damageThreshold && damageThreshold?.length && Math.floor(damageThreshold?.length / 2);
	const medianHP = midpoint ? (damageThreshold.length % 2 === 1 ?	damageThreshold[midpoint] :	(damageThreshold[midpoint - 1] + damageThreshold[midpoint]) / 2) : (damageThreshold || null);
	const embed = new EmbedBuilder().setTitle(`${name} (${id}) - Scale ${scale}`).setDescription(`*${isPreview ? '???\n[This monster is not yet available to fight.]' : description}${isRetired ? '\n\n [This monster cannot be fought without performing a Summoning Circle ritual]' : ''}*`).setColor(monster_color);
	const fields = [
		(size !== null && { name: 'Size', value: `${size}`, inline: true }),
		(medianHP !== null && { name: 'Median HP', value: `${medianHP}`, inline: true }),
		(armorClass !== null && { name: 'AC Roll', value: `${Array.isArray(armorClass) ? armorClass.map(rollCode => rollCode.join('d')).join('+') + '+1d' + (curseDie || 5) : armorClass + '+1d' + (curseDie || 5)}`, inline: true }),
		(enrageThreshold !== null && { name: 'Enrage Threshold', value: `${enrageThreshold}`, inline: true }),
		(stunThreshold !== null && { name: 'Stun Threshold', value: `${stunThreshold}`, inline: true }),
		(mechanics !== null && { name: 'Mechanics', value: mechanics }),
		(basicAction !== null && { name: 'Instinct', value: basicAction }),
		(enrage !== null && { name: 'Enrage', value: enrage }),
		(stun !== null && { name: 'Stun', value: stun }),
	].filter(a => a);
	embed.addFields(...fields);
	return embed;
}

function raidEmbed(raid) {
	const { id, name, description, mechanics, monsters, uniqueRoomModifiers, isPreview, isRetired } = raid;
	const fetchedMonsters = monsters.map(monster => getRaidMonster(monster)).filter(a => a);
	const monstersList = fetchedMonsters.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => b.scale - a.scale);
	const monsterField = monstersList.map(monster => `${monster?.type === 'boss' ? underlineText(boldText(monster.name)) : (monster?.type === 'miniboss' ? boldText(monster.name) : monster.name)} [${monster.id}] - Scale ${monster.scale} ${monster.type === 'boss' ? boldText('[Boss]') : ''}${monster.type === 'miniboss' ? boldText('[Mini-Boss]') : ''}`).join('\n');
	const embed = new EmbedBuilder().setTitle(`${name} (${id})`).setDescription(`*${isPreview ? '??? [This raid is not yet available to fight.]' : description}${isRetired ? '\n\n[This raid cannot be fought without performing a Summoning Circle ritual]' : ''}*`).setColor(monster_color);
	const fields = [
		(mechanics !== null && { name: 'Mechanics', value: mechanics }),
		(monsters?.length > 0 && { name: 'Monsters', value: monsterField }),
	].filter(a => a);
	embed.addFields(...fields);
	return embed;
}

function raidEmbed(raid) {
	const { id, name, description, mechanics, monsters, uniqueRoomModifiers, isPreview, isRetired } = raid;
	const fetchedMonsters = monsters.map(monster => getRaidMonster(monster)).filter(a => a);
	const monstersList = fetchedMonsters.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => b.scale - a.scale);
	const monsterField = monstersList.map(monster => `${monster?.type === 'boss' ? underlineText(boldText(monster.name)) : (monster?.type === 'miniboss' ? boldText(monster.name) : monster.name)} [${monster.id}] - Scale ${monster.scale} ${monster.type === 'boss' ? boldText('[Boss]') : ''}${monster.type === 'miniboss' ? boldText('[Mini-Boss]') : ''}`).join('\n');
	const embed = new EmbedBuilder().setTitle(`${name} (${id})`).setDescription(`*${isPreview ? '??? [This raid is not yet available to fight.]' : description}${isRetired ? '\n\n[This raid cannot be fought without performing a Summoning Circle ritual]' : ''}*`).setColor(monster_color);
	const fields = [
		(mechanics !== null && { name: 'Mechanics', value: mechanics }),
		(monsters?.length > 0 && { name: 'Monsters', value: monsterField }),
	].filter(a => a);
	embed.addFields(...fields);
	return embed;
}

function lootEmbed(monsterId, lootString) {
	return new EmbedBuilder().setTitle(`Looting Monster: ${toProperCase(monsterId)}`).setDescription(lootString.replaceAll(/\*/gm, toProperCase(monsterId))).setColor(monster_color);
}

function monsterAttackedEmbed(monster, damage, currentDamage, attackRoll, baseAC, monsterCurseDie, monsterCurseDieSize, flatMod, monsterAC) {
	const isAttackRoll = !(attackRoll === null || attackRoll === undefined);
	const embed = new EmbedBuilder().setTitle(isAttackRoll ? `Attacking ${monster.name} for ${damage} damage:` : `Applying ${damage} damage to ${monster.name}:`);
	if (isAttackRoll) {
		let baseRollDesc = baseAC;
		if (Array.isArray(monster.armorClass)) {
			baseRollDesc = '';
			for (let i = 0; i < monster.armorClass.length; i++) {
				baseRollDesc += `${monster.armorClass[i].join('d')}${baseAC.map((subArray, index) => rollResultsToString(subArray, index, monster.armorClass[i]))}`;
			}
		}
		const rollDescription = `[${baseRollDesc}+1d${monsterCurseDieSize}(${monsterCurseDie})${flatMod ? (flatMod > 0 ? `+${flatMod}` : flatMod) : ''}]`;
		embed.setDescription(`${attackRoll >= monsterAC ? `**${attackRoll}**` : attackRoll} vs ${monsterAC > attackRoll ? `**${monsterAC}**` : monsterAC} ${rollDescription}: ${attackRoll >= monsterAC ? `**Hit!** ${damage} Dealt (${currentDamage} Total)` : `Missed by ${attackRoll - monsterAC}`}`);
	}
	else {
		embed.setDescription(`${damage} Damage Dealt (${currentDamage} Total)`);
	}
	embed.setColor(monster_color);
	return embed;
}

function monsterDefeatedEmbed(users) {
	return new EmbedBuilder().setTitle('Monster Down!').setDescription(`The following users must do \`\`/monster loot\`\` before init will close:${users.map(usr => `<@${usr}>`).join(', ')}`).setColor(monster_color);
}

function monsterEnragedEmbed(monster) {
	console.log(monster);
	return new EmbedBuilder()
		.setTitle(`${monster.name} Enraged!`)
		.setDescription('*The monster cannot be Stunned or have its Stun Bar Increase from further actions while enraged. If it was already Stunned, it will still apply its Enrage Effect.\nAfter the Monster has used its Enrage Effect once, it stops being enraged at the start of its next turn.*')
		.addFields([{ name: 'Enrage Effect', value: monster.enrage }])
		.setColor(monster_color);
}

function monsterStunAppliedEmbed(monster, stunAmount, totalStun) {
	return new EmbedBuilder()
		.setTitle(`Applying ${stunAmount} Stun to The ${monster.name}!`)
		.setDescription(`${stunAmount} Applied (${totalStun}/${monster.stunThreshold})`)
		.setColor(monster_color);
}

function monsterStunnedEmbed(monster, stunCount, stunMax) {
	return new EmbedBuilder()
		.setTitle(`${monster.name} Stunned (${stunCount}/${stunMax})!`)
		.setDescription('*All players gain +3 Value on their Strikes on their next turn.\nUntil the start of the next round, the monster cannot take Actions or Reactions, including its Instinct and Card.*')
		.addFields([{ name: 'Stun Effect', value: monster.stun }])
		.setColor(monster_color);
}

function tagInfoEmbed(tag) {
	const embed = new EmbedBuilder().setTitle(`Tag: ${tag.name}`);
	embed.setColor(monster_color);
	const fields = [
		{ name: 'Owner', value: `<@${tag.ownerId}>`, inline: true },
		{ name: 'Uses', value: `${tag.usage_count}`, inline: true },
	];
	embed.addFields(...fields);
	return embed;
}

module.exports = { statusEmbed, tarotEmbed, wikiEmbed, wikiListEmbed, monsterEmbed, raidEmbed, lootEmbed, monsterAttackedEmbed, monsterDefeatedEmbed, tagInfoEmbed, monsterEnragedEmbed, monsterStunnedEmbed, monsterStunAppliedEmbed, raidEmbed };