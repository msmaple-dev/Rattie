const db = require('../database');
const { QueryTypes } = require('sequelize');
const scheduler_keyv = require('../keyv_stores/scheduler_keyv');
const { unweightedSelect } = require('./roll_utils');
const { wikiEmbed } = require('../components/embeds');
const { showcaseChannelId, seasonChannelId } = require('../../config.json');
const { toProperCase } = require('./string_utils');

async function checkShowcase(client) {
	if (await scheduler_keyv.has('showcaseDate')) {
		const now = Date.now();
		const showcaseDateVal = await scheduler_keyv.get('showcaseDate');
		const showcaseDate = new Date(showcaseDateVal);
		const tomorrowDate = new Date();
		tomorrowDate.setDate(tomorrowDate.getDate() + 1);
		tomorrowDate.setHours(15, 0, 0);
		// 10am EST
		if (now >= showcaseDate) {
			await scheduler_keyv.set('showcaseDate', tomorrowDate);
			const validWikis = await db.query('SELECT * FROM wikis WHERE showcaseEnabled IS NOT false AND showcaseUses <= (SELECT MIN(showcaseUses) FROM wikis WHERE length(concat(warlockName, quote, about, faction, appearance, abilities, scent)) > 450 AND showcaseEnabled IS NOT false) AND length(concat(warlockName, quote, about, faction, appearance, abilities, scent)) > 450', {
				type: QueryTypes.SELECT,
			});

			const chosenWiki = unweightedSelect(validWikis);
			await db.query('UPDATE wikis SET showcaseUses = ? WHERE id = ?', {
				replacements: [(parseInt(chosenWiki.showcaseUses) + 1), chosenWiki.id],
				type: QueryTypes.UPDATE,
			});
			const chosenWikiEmbed = wikiEmbed(chosenWiki);
			const showcaseChannel = await client.channels.fetch(showcaseChannelId);
			if (showcaseChannel) {
				await showcaseChannel.send({ content:`The Warlock Wiki of the Day Today is: **${chosenWiki.warlockName || toProperCase(chosenWiki.name)}**, owned by <@${chosenWiki.ownerId}>!`, embeds: [chosenWikiEmbed] });
			}
			else {
				console.log('Invalid channel!');
			}
		}
	}
	else {
		await scheduler_keyv.set('showcaseDate', 0);
	}
}

async function checkReset(client) {
	if (await scheduler_keyv.has('resetDate')) {
		const now = Date.now();
		const resetDateVal = await scheduler_keyv.get('resetDate');
		const resetDate = new Date(resetDateVal);
		const tomorrowDate = new Date();
		tomorrowDate.setDate(tomorrowDate.getDate() + 7);
		tomorrowDate.setHours(20, 0, 0);
		// 3pm EST
		if (now >= resetDate) {
			await scheduler_keyv.set('resetDate', tomorrowDate);
			const seasonChannel = await client.channels.fetch(seasonChannelId);
			if (seasonChannel) {
				await seasonChannel.send({ content: '**Weekly Reset!**' });
			}
			else {
				console.log('Invalid channel!');
			}
		}
	}
	else {
		await scheduler_keyv.set('resetDate', 0);
	}
}

async function checkDailies(client) {
	await checkReset(client);
	await checkShowcase(client);
}

module.exports = { checkDailies };