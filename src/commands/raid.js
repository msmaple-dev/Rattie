const { SlashCommandBuilder } = require('discord.js');
const { raidEmbed } = require('../components/embeds');
const { getValidRaidMonsters, getValidRaids, getRaid, generateRoom, getRaidExperience, getMonstersForRaid,
	generateFloor, goToRoom, getMonsterString, getRaidID, getRaidMonster,
} = require('../functions/raid_utils');
const { newInit, getUserDecks } = require('../functions/init_utils');
const init_keyv = require('../keyv_stores/init_keyv');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { unpinChannelPins } = require('../functions/chat_utils');

const validRaids = getValidRaids();
const validRaidMonsters = getValidRaidMonsters();
const raidChoices = validRaids.map(raid => {return { name:raid, value:raid };});
const raidMonsterChoices = validRaidMonsters.map(monsters => {return { name:monsters, value:monsters };});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Lets you start and manage raids')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows all raid types available to try in Cursedice'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View a specific Raid\'s description')
				.addStringOption(option => option.setName('type').setDescription('Raid Type').addChoices(...raidChoices).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create a Raid of a given type')
				.addStringOption(option => option.setName('type').setDescription('Raid Type').addChoices(...raidChoices).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('join')
				.setDescription('Join the Raid in the current channel'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Starts the Raid in the current channel'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('continue')
				.setDescription('Continues on with your raid to a specific room')
				.addIntegerOption(option => option.setName('room').setDescription('Room #').setMinValue(1).setMaxValue(2).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('cleared')
				.setDescription('Marks a room as successfully cleared'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('loss')
				.setDescription('Stops a Raid prematurely due to party wipe or mid-room concession'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('Shows the current room # & It\'s Monsters'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('loot')
				.setDescription('Shows all loot you\'ve collected in a raid and which are Pocketed'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('pocket')
				.setDescription('Pockets a non-boss loot you\'ve seen in the raid so far')
				.addIntegerOption(option => option.setName('id').setDescription('Loot #').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('monster')
				.setDescription('Shows information on a hunt monster')
				.addStringOption(option => option.setName('name').setDescription('Monster Name').addChoices(...raidMonsterChoices).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('test')
				.setDescription('Tests Raids')
				.addStringOption(option => option.setName('type').setDescription('Raid Type').addChoices(...raidChoices).setRequired(true))
				.addIntegerOption(option => option.setName('room').setDescription('Room #').setRequired(true))
				.addIntegerOption(option => option.setName('scale').setDescription('Participant Scale').setRequired(false)),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		// const sqlID = BigInt(userID);
		const channelId = interaction.channelId;
		const raidType = interaction.options.getString('type');
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'list') {
			const raidsData = validRaids.map(raidId => getRaid(raidId));
			const retiredRaids = raidsData.filter(raid => raid?.isRetired).sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.scale - b.scale);
			const fightableRaids = raidsData.filter(raid => !(raid?.isRetired)).sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.scale - b.scale);
			let outputText = '__**List of Usable Raids**__\n';
			fightableRaids.forEach(raid => {outputText += `${(raid.isPreview) ? `*${raid.name}` : `**${raid.name}**`} [${raid.id}]${raid.isPreview ? ' [Preview]' : ''}${(raid.isPreview) ? '*' : ''}\n`;});
			if (retiredRaids?.length) {
				outputText += '\n__**List of Retired Raids**__\n';
				retiredRaids.forEach(raid => {outputText += `*${raid.name} [${raid.id}] ${typeof raid.isRetired === 'string' || raid.isRetired instanceof String ? `[${raid.isRetired}]` : '[Retired]'}*\n`;});
			}
			await interaction.reply(outputText);
		}
		else if (subCommand === 'show' || subCommand === 'create') {
			await interaction.deferReply();
			const raid = structuredClone(getRaid(raidType));
			if (raid) {
				const fetchedMonsters = raid?.monsters.map(monster => getRaidMonster(monster)).filter(a => a);
				const embed = raidEmbed(raid, fetchedMonsters);
				if (subCommand === 'create') {
					if (raid.isPreview) {
						await interaction.editReply('You cannot fight that monster yet!');
					}
					// Checks if channel type is a thread
					else if (interaction.channel?.type !== 11) {
						await interaction.editReply('You can only do raids in threads!');
					}
					else {
						const startingInit = newInit([{
							userID: userID,
							identifier: 'Monster Draw',
							initVal: 100,
							decks: {},
						}, { userID: userID, identifier: 'Monsters Act', initVal: 1, decks: {} }], raid, true);
						startingInit.monsterLibrary = await getUserDecks(0);
						await init_keyv.set(channelId, startingInit);

						await db.query('INSERT INTO raids (channelId, rooms, startTime, endTime, raidType) VALUES (?, ?, ?, ?, ?)', {
							replacements: [channelId, null, Date.now(), null, raid.id],
							type: QueryTypes.INSERT,
						});
						await interaction.editReply(`Created a new ${raid.name}, managed by <@${userID}>!\n**You must join via entering into init BEFORE the raid starts!**`);
						await interaction.followUp({ embeds: [embed] }).then(msg => msg.pin('Raid Info Pin'));
					}
				}
				else {
					await interaction.editReply({ embeds: [embed] });
				}
			}
			else {
				await interaction.editReply(`Invalid Raid Name "${raid}"`);
			}
		}
		else if (subCommand === 'start') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId) ?? 0;
			let outputText;

			if (currentInit) {
				if (currentInit?.round === 0 && currentInit?.raid?.id) {
					outputText = '**Raid Start!**\n';
					outputText += generateFloor(currentInit);
					await init_keyv.set(channelId, currentInit);
				}
				else if (!currentInit?.raid?.id) {
					outputText = 'Use ``/start`` to start non-raids initiatives!';
				}
				else {
					outputText = 'Combat Has Already Started!';
				}
			}
			else {outputText = 'There is no raid in this channel!';}
			await interaction.editReply(outputText);
		}
		else if (subCommand === 'continue') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId) ?? 0;
			const roomNum = interaction.options.getInteger('room');
			let outputText;

			if (currentInit) {
				if (currentInit.raid?.id) {
					if (currentInit.raid?.currentFloor[roomNum - 1]) {
						outputText = `**Moving to Room ${roomNum}**\n`;
						outputText += currentInit.roomDescriptions[roomNum - 1];
						outputText += await goToRoom(currentInit, roomNum, channelId);

					}
					else {
						outputText = `Invalid Room Index (${roomNum})`;
					}
				}
				else {
					outputText = 'You can\'t use this command in non-raid combat!';
				}
			}
			else {outputText = 'There is no raid in this channel!';}
			await interaction.editReply(outputText);
		}
		else if (subCommand === 'status') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId) ?? 0;
			let outputText;

			if (currentInit) {
				if (currentInit?.raid?.id) {
					const raid = currentInit.raid;
					outputText = `**Room Number ${currentInit.roomNumber}**\n`;
					outputText += `**Monsters:** ${getMonsterString(currentInit.currentRoom)}\n`;
					outputText += `**Current Exp Earned (Prior to This Room):** ${getRaidExperience(raid, currentInit.roomNumber - 1)}\n`;
					outputText += `**Exp Earned After This Room [Raid Finish/Loss]:** ${getRaidExperience(raid, currentInit.roomNumber, true)} / ${getRaidExperience(raid, currentInit.roomNumber, false)}\n`;
				}
				else {
					outputText = 'You can\'t use this command in non-raid combat!';
				}
			}
			else {outputText = 'There is no raid in this channel!';}
			await interaction.editReply(outputText);
		}
		else if (subCommand === 'end' || subCommand === 'loss') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId) ?? 0;
			let outputText;

			if (currentInit) {
				if (currentInit?.raid?.id) {
					if (subCommand === 'end' && currentInit.currentRoom !== {}) {
						outputText = 'You cannot use ``/raid end`` while in an active room!';
					}
					else {
						const raidId = await getRaidID(channelId);
						const endTime = Date.now();
						await db.query('UPDATE raids SET rooms = ?, status = ?, endTime = ? WHERE raidId = ?', {
							replacements: [currentInit.currentRoom - 1, 'Finished', endTime, raidId],
							type: QueryTypes.UPDATE,
						});
						// TODO: Add Total Loot to outputText
						outputText = `Raid Ended at Room ${currentInit.currentRoom}!\n**Total Exp: ${getRaidExperience(currentInit.raid, currentInit.roomNumber, subCommand === 'loss')}**\n**Total Loot:**`;
						await init_keyv.delete(channelId);
						await unpinChannelPins(interaction.channel);
					}
				}
				else {
					outputText = 'You can\'t use this command in non-raid combat!';
				}
			}
			else {outputText = 'There is no raid in this channel!';}
			await interaction.editReply(outputText);
		}
		else if (subCommand === 'test') {
			await interaction.deferReply();
			const raid = structuredClone(getRaid(raidType));
			const roomNum = interaction.options.getInteger('room');
			const raidScale = interaction.options.getInteger('scale') || 3;
			if (raid) {
				raid.monsters = getMonstersForRaid(raid);
				const room = generateRoom(raid, roomNum, raidScale);
				const roomString = `Room ${roomNum} (Scale ${raidScale}): ${getMonsterString(room)}`;
				const estimatedXP = getRaidExperience(raid, roomNum);
				const outputString = roomString + `\nEstimated XP Earned So Far (Unfinished Raid): ${estimatedXP}`;
				// if (interaction.options.getSubcommand() === 'fight') {
				// 	if (raid.isPreview) {
				// 		await interaction.editReply('You cannot fight that monster yet!');
				// 	}
				// 	else {
				// 		const startingInit = newInit([{
				// 			userID: userID,
				// 			identifier: `${raid.name}'s Draw`,
				// 			initVal: 100,
				// 			decks: {},
				// 		}, { userID: userID, identifier: `${raid.name} Acts`, initVal: 1, decks: {} }], raid);
				// 		startingInit.monsterLibrary = await getUserDecks(0);
				// 		await init_keyv.set(channelId, startingInit);
				//
				// 		// Checks if channel type is a thread, then logs if it is
				// 		if (interaction.channel?.type === 11) {
				// 			await db.query('INSERT INTO encounters (channelId, rounds, startTime, endTime, monster) VALUES (?, ?, ?, ?, ?)', {
				// 				replacements: [channelId, null, Date.now(), null, raid.id],
				// 				type: QueryTypes.INSERT,
				// 			});
				// 		}
				// 		await interaction.editReply(`Started new fight against ${raid.name}, managed by <@${userID}>!`);
				// 		await interaction.followUp({ embeds: [embed] }).then(msg => msg.pin('Monster Hunt Pin'));
				// 	}
				// }
				// else {
				await interaction.editReply(outputString);
				// }
			}
			else {
				await interaction.editReply(`Invalid Monster Name "${raid}"`);
			}
		}
	},
};