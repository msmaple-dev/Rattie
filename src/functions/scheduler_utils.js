const db = require('../database');
const { QueryTypes } = require('sequelize');
const scheduler_keyv = require('../keyv_stores/scheduler_keyv');
const { unweightedSelect } = require('./roll_utils');
const { wikiEmbed } = require('../components/embeds');
const { showcaseChannelId } = require('../../config.json');
const { toProperCase } = require('./string_utils');

async function checkShowcase(client){
	if(await scheduler_keyv.has("showcaseDate")){
		const now = Date.now();
		let showcaseDateVal = await scheduler_keyv.get("showcaseDate");
		let showcaseDate = new Date(showcaseDateVal);
		let tomorrowDate = new Date();
		tomorrowDate.setDate(tomorrowDate.getDate()+1);
		tomorrowDate.setHours(15, 0, 0);
		if(now >= showcaseDate){
			await scheduler_keyv.set("showcaseDate", tomorrowDate);
			let validWikis = await db.query('SELECT * FROM wikis WHERE showcaseUses <= (SELECT MIN(showcaseUses) FROM wikis WHERE length(concat(warlockName, quote, about, faction, appearance, abilities, scent)) > 450) AND length(concat(warlockName, quote, about, faction, appearance, abilities, scent)) > 450', {
				type: QueryTypes.SELECT,
			})
			let chosenWiki = unweightedSelect(validWikis);
			await db.query('UPDATE wikis SET showcaseUses = ? WHERE id = ?', {
				replacements: [chosenWiki.showcaseUses+1, chosenWiki.id],
				type: QueryTypes.UPDATE
			})
			let chosenWikiEmbed = wikiEmbed(chosenWiki)
			let showcaseChannel = await client.channels.fetch(showcaseChannelId)
			if(showcaseChannel){
				await showcaseChannel.send({ content:`The Warlock Wiki of the Day Today is: **${chosenWiki.warlockName || toProperCase(chosenWiki.name)}**, owned by <@${chosenWiki.ownerId}>!`, embeds: [chosenWikiEmbed]})
			} else {
				console.log("Invalid channel!")
			}
		}
	} else {
		await scheduler_keyv.set("showcaseDate", 0)
	}
}

module.exports = { checkShowcase }