const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { getMonster, drawDefaultLoot, drawMonsterCard, getValidMonsters, logDPR, getEncounterID, rollAC, getMonsterCards,
	concCheck,
} = require('../functions/monster_utils');
const { monsterEmbed, lootEmbed, monsterAttackedEmbed, monsterDefeatedEmbed, statusEmbed } = require('../components/embeds');
const init_keyv = require('../keyv_stores/init_keyv');
const { newInit, nextTurn, uniqueUsers, getModifierString, getACModifiers, procModifiers,
	modifierCategories, modifierTypes, cullModifiers,
} = require('../functions/init_utils');
const { unpinChannelPins } = require('../functions/chat_utils');
const { monster_color } = require('../components/constants');
const { rollFromString } = require('../functions/roll_utils');

const validMonsters = getValidMonsters();
const monsterChoices = validMonsters.map(monster => {return { name:monster, value: monster };});
const categoryChoices = Object.entries(modifierCategories).map((value) => {return { name: value[1], value: value[0] };});
const typeChoices = Object.entries(modifierTypes).map((value) => {return { name: value[1], value: value[0] };});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('monster')
		.setDescription('Lets you fight or view Monster Info')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows all monsters available to fight in Cursedice'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View a specific Monster\'s stats')
				.addStringOption(option => option.setName('name').setDescription('Monster Name').addChoices(...monsterChoices).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('fight')
				.setDescription('Fight a specific Monster')
				.addStringOption(option => option.setName('name').setDescription('Monster Name').addChoices(...monsterChoices).setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('loot')
				.setDescription('Loot a specific monster')
				.addIntegerOption(option => option.setName('damagetaken').setDescription('Damage taken in the fight').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('attack')
				.setDescription('Attack the current monster')
				.addIntegerOption(option => option.setName('roll').setDescription('Attack Roll').setRequired(true))
				.addIntegerOption(option => option.setName('dmg').setDescription('Damage').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('damage')
				.setDescription('Damage the current monster')
				.addIntegerOption(option => option.setName('dmg').setDescription('Damage').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('pass')
				.setDescription('End the round and draw the next card'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('cards')
				.setDescription('View all the cards a given monster has')
				.addStringOption(option => option.setName('name').setDescription('Monster Name').addChoices(...monsterChoices).setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Display cards publicly?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modifier')
				.setDescription('Add a modifier to the current monster')
				.addStringOption(option => option.setName('category').setDescription('Modifier Category').addChoices(...categoryChoices).setRequired(true))
				.addStringOption(option => option.setName('type').setDescription('Modifier Type').addChoices(...typeChoices).setRequired(true))
				.addIntegerOption(option => option.setName('amount').setDescription('Modifier Amount').setRequired(true))
				.addIntegerOption(option => option.setName('duration').setDescription('Modifier Duration (Default 3)').setRequired(false))
				.addIntegerOption(option => option.setName('procs').setDescription('Modifier Procs (Eg: Paralyzed)').setRequired(false))
				.addStringOption(option => option.setName('note').setDescription('Modifier Note').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('View any modifiers on a monster being fought'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('cure')
				.setDescription('Remove a modifier by ID (Check IDs w/ Status!)')
				.addIntegerOption(option => option.setName('id').setDescription('Modifier ID').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('save')
				.setDescription('Have a monster make a save, using its current modifiers')
				.addIntegerOption(option => option.setName('count').setDescription('# of Saves Rolled (Default 1)').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('strike')
				.setDescription('Have a monster make a strike, using its current modifiers')
				.addStringOption(option => option.setName('roll').setDescription('Roll code').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('redraw')
				.setDescription('Draw another monster card, using that one instead'),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		// const sqlID = BigInt(userID);
		const channelId = interaction.channelId;
		const monsterName = interaction.options.getString('name');
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'list') {
			const monstersData = validMonsters.map(monsterId => getMonster(monsterId));
			const retiredMonsters = monstersData.filter(monster => monster?.isRetired).sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.scale - b.scale);
			const fightableMonsters = monstersData.filter(monster => !(monster?.isRetired)).sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.scale - b.scale);
			let outputText = '__**List of Fightable Monsters**__\n';
			fightableMonsters.forEach(monster => {outputText += `${(monster.isPreview) ? `*${monster.name}` : `**${monster.name}**`} [${monster.id}] - Scale ${monster.scale}${monster.isPreview ? ' [Preview]' : ''}${(monster.isPreview) ? '*' : ''}\n`;});
			outputText += '\n__**List of Retired Monsters**__\n';
			retiredMonsters.forEach(monster => {outputText += `*${monster.name} [${monster.id}] - Scale ${monster.scale} ${typeof monster.isRetired === 'string' || monster.isRetired instanceof String ? `[${monster.isRetired}]` : '[Retired]'}*\n`;});
			interaction.reply(outputText);
		}
		else if (subCommand === 'show' || subCommand === 'fight') {
			await interaction.deferReply();
			const monster = getMonster(monsterName);
			if (monster) {
				const embed = monsterEmbed(monster);
				if (interaction.options.getSubcommand() === 'fight') {
					if (monster.isPreview) {
						await interaction.editReply('You cannot fight that monster yet!');
					}
					else {
						if (await init_keyv.has(channelId)) {
							const currentInit = await init_keyv.get(channelId);
							currentInit.users.push({
								userID: userID,
								identifier: `${monster.name}'s Draw`,
								initVal: 100,
								decks: {},
							});
							currentInit.users.push({ userID: userID, identifier: `${monster.name} Acts`, initVal: 1, decks: {} });
							currentInit.monster = monster;
							currentInit.looting = false;
							currentInit.damageDealt = 0;
							currentInit.dpr = [];
							currentInit.monsterCards = monster && monster.attackCards ? monster.attackCards.map(card => {return { name: card.split(' | ')[0], effect: card.split(' | ')[1], severity: 'Monster', color: monster_color };}) : null;
							currentInit.modifiers = [];
							currentInit.modifiersApplied = 0;
							await init_keyv.set(channelId, currentInit);
						}
						else {
							const startingInit = newInit([{
								userID: userID,
								identifier: `${monster.name}'s Draw`,
								initVal: 100,
								decks: {},
							}, { userID: userID, identifier: `${monster.name} Acts`, initVal: 1, decks: {} }], monster);
							await init_keyv.set(channelId, startingInit);
						}

						// Checks if channel type is a thread, then logs if it is
						if (interaction.channel?.type === 11) {
							await db.query('INSERT INTO encounters (channelId, rounds, startTime, endTime, monster) VALUES (?, ?, ?, ?, ?)', {
								replacements: [channelId, null, Date.now(), null, monster.id],
								type: QueryTypes.INSERT,
							});
						}
						await interaction.editReply(`Started new fight against ${monster.name}, managed by <@${userID}>!`);
						await interaction.followUp({ embeds: [embed] }).then(msg => msg.pin('Monster Hunt Pin'));
					}
				}
				else {
					await interaction.editReply({ embeds: [embed] });
				}
			}
			else {
				await interaction.editReply(`Invalid Monster Name "${monster}"`);
			}
		}
		else if (subCommand === 'loot') {
			const currentInit = await init_keyv.get(channelId);
			const monster = currentInit?.monster;
			const damageTaken = interaction.options.getInteger('damagetaken');
			const encounterId = await getEncounterID(channelId);

			if (monster) {
				if (!(currentInit.users.filter(usr => usr.userID === userID)) || currentInit.users.filter(usr => usr.userID === userID)?.length <= 0) {
					await interaction.reply('You aren\'t in the current init!');
				}
				else if (!currentInit.looting) {
					await interaction.reply('The monster has not yet been defeated!');
				}
				else {
					const embed = lootEmbed(currentInit.monster.id, drawDefaultLoot());
					await interaction.reply({ embeds: [embed] });
					await db.query('REPLACE INTO participants (encounterId, userId, damageTaken) VALUES (?, ?, ?)', {
						replacements: [encounterId, userID, damageTaken],
						type: QueryTypes.INSERT,
					});

					currentInit.users = currentInit.users.filter(usr => usr.userID !== userID);
					if (currentInit.users.length > 0) {
						await init_keyv.set(channelId, currentInit);
					}
					else {
						await init_keyv.delete(channelId);
						await unpinChannelPins(interaction.channel);
						await interaction.followUp('Everyone has rolled loot! GG!');
					}
				}
			}
			else {
				await interaction.reply('No monster is being fought in this channel!');
			}
		}
		else if (subCommand === 'attack' || subCommand === 'damage') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId);
			const attackRoll = interaction.options.getInteger('roll');
			const dmg = interaction.options.getInteger('dmg');
			const monster = currentInit?.monster;
			let monsterHit = false;
			if (monster) {
				const [flatMod, curseMod] = getACModifiers(currentInit.modifiers);
				const [rolledAC, monsterCurseDieResult] = rollAC(monster.armorClass, (monster.curseDie || 5) + curseMod);
				let totalDefense = parseInt(rolledAC) + monsterCurseDieResult + parseInt(flatMod);
				if (Array.isArray(rolledAC)) {totalDefense = rolledAC.map(acRolls => Math.max(...acRolls)).reduce((a, b) => a + b) + monsterCurseDieResult + parseInt(flatMod);}
				if (subCommand === 'damage' || attackRoll >= totalDefense) {
					monsterHit = dmg > 0;
					currentInit.damageDealt += dmg;
					currentInit.dpr[currentInit.round] = currentInit.dpr[currentInit.round] ? currentInit.dpr[currentInit.round] + dmg : dmg;
				}

				await interaction.editReply({ embeds: [monsterAttackedEmbed(monster, dmg, currentInit.damageDealt, attackRoll, rolledAC, monsterCurseDieResult, (monster.curseDie || 5) + curseMod, flatMod, totalDefense)] });

				if (monsterHit && concCheck(currentInit.damageDealt, monster.damageThreshold)) {
					currentInit.looting = true;
					currentInit.users = uniqueUsers(currentInit.users);
					const userList = currentInit.users.map(usr => usr.userID);
					await interaction.followUp({ embeds: [monsterDefeatedEmbed(userList)] });
					const encounterId = await getEncounterID(channelId);
					const endTime = Date.now();
					await db.query('UPDATE encounters SET rounds = ?, endTime = ?, status = ?, modifiersApplied = ? WHERE encounterId = ?', {
						replacements: [currentInit.round, endTime, 'Finished', currentInit.modifiersApplied, encounterId],
						type: QueryTypes.UPDATE,
					});
					await logDPR(encounterId, currentInit.dpr);
				}
				else if (subCommand === 'attack') {
					const outputText = procModifiers(currentInit.modifiers, 'defend');
					currentInit.modifiers = cullModifiers(currentInit.modifiers);
					if (outputText) {
						await interaction.followUp(outputText);
					}
				}
				await init_keyv.set(channelId, currentInit);
			}
			else {
				await interaction.editReply('No monster is being fought in this channel!');
			}
		}
		else if (subCommand === 'modifier') {
			await interaction.deferReply();
			const modifierAmount = interaction.options.getInteger('amount');
			const modifierCategory = interaction.options.getString('category');
			const modifierType = interaction.options.getString('type');
			const modifierDuration = interaction.options.getInteger('duration') || 3;
			const modifierProcs = interaction.options.getInteger('procs') || null;
			const modifierNote = interaction.options.getString('note') || null;
			const currentInit = await init_keyv.get(channelId);

			const modifier = { id: currentInit.modifiersApplied + 1, category: modifierCategory, type: modifierType, amount: modifierAmount, duration: modifierDuration, procs: modifierProcs, note: modifierNote };
			currentInit.modifiers.push(modifier);
			currentInit.modifiersApplied += 1;

			await init_keyv.set(channelId, currentInit);
			await interaction.editReply(`Added ${getModifierString(modifier)}`);

			// modifier structure: {id, category, amount, type, duration, procs, note}[]
			// Each trigger of modifier: decrement modifier procs if extant, clear 0s AFTER RESOLUTION
			// Each /pass: decrement modifier durations if extant, clear 0s
			// Categories: Attack, Defense, Saves
			// Type: Flat, Curse Die Size (Curse)
			// +/- act as modifiers to value, Flat numbers set for everything but flat penalty
			// ID: Increment over time
			// Add # of modifiers dealt to end of monster data recording
		}
		else if (subCommand === 'status') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId);
			const modifiers = currentInit.modifiers;
			let outputText = 'Current Monster Modifiers:';
			if (currentInit.monster) {
				if (modifiers?.length > 0) {
					for (const category of Object.keys(modifierCategories)) {
						const categoryModifiers = modifiers.filter(modifier => modifier.category === category).sort((a, b) => (a.id - b.id));
						if (categoryModifiers?.length > 0) {
							const typeSums = {};
							for (const modifier of categoryModifiers) {
								if (!typeSums[modifier.type]) {
									typeSums[modifier.type] = modifier.amount;
								}
								else {
									typeSums[modifier.type] += modifier.amount;
								}
							}
							outputText += `\n\n**${modifierCategories[category]} Modifiers** (Rolling at 1d20+1d${typeSums['curse'] && typeSums['curse'] !== 0 ? Math.max(1, 6 + typeSums['curse']) : 6}${typeSums['flat'] !== 0 ? (typeSums['flat'] > 0 ? `+${typeSums['flat']}` : `${typeSums['flat']}`) : ''})\n`;
							outputText += `${categoryModifiers.map(modifier => getModifierString(modifier)).join('\n')}`;
						}
					}
					outputText += `\n\nTotal Active Modifiers: ${modifiers.length}\nTotal Modifiers Applied This Fight: ${currentInit.modifiersApplied}`;
				}
				else {
					outputText = `No Current Modifiers!\nTotal Modifiers Applied This Fight: ${currentInit.modifiersApplied}`;
				}
			}
			else {
				outputText = 'No Monster being Fought!';
			}
			await interaction.editReply(outputText);
		}
		else if (subCommand === 'cure') {
			const modifierID = interaction.options.getInteger('id');
			const currentInit = await init_keyv.get(channelId);
			const filteredModifiers = currentInit.modifiers.filter(modifier => modifier.id === modifierID).map(modifier => getModifierString(modifier));
			currentInit.modifiers = currentInit.modifiers.filter(modifier => modifier.id !== modifierID);
			await init_keyv.set(channelId, currentInit);
			await interaction.reply(`Removed Modifier${filteredModifiers.length > 1 ? 's:\n' : ': '}${filteredModifiers.join('\n')}`);
		}
		else if (subCommand === 'save' || subCommand === 'strike') {
			await interaction.deferReply();
			const count = interaction.options.getInteger('count') || 1;
			const initialRollCode = interaction.options.getString('roll') || (subCommand === 'strike' ? '1+0+0' : '1+6+0');
			let outputText = '';
			const currentInit = await init_keyv.get(channelId);
			const monster = currentInit?.monster;
			const modifiers = currentInit.modifiers;
			if (monster) {
				const modifierType = (subCommand === 'strike' ? 'attack' : 'saves');
				for (let i = 0; i < count; i++) {
					outputText += rollFromString(initialRollCode, (subCommand === 'strike' ? 3 : 0), modifiers, modifierType);
					const removedMods = procModifiers(modifiers, modifierType);
					outputText += removedMods ? '\n' + removedMods : '';
					currentInit.modifiers = cullModifiers(modifiers);
				}
				await interaction.editReply(outputText);
				await init_keyv.set(channelId, currentInit);
			}
			else {
				await interaction.editReply('No monster is being fought in this channel!');
			}
		}
		else if (subCommand === 'cards') {
			const isPrivate = interaction.options.getBoolean('private') || false;
			const replyArray = getMonsterCards(monsterName);
			await interaction.reply({ embeds: replyArray.slice(0, 5), ephemeral: isPrivate });
			if (replyArray.length > 5) {
				for (let i = 5; i < replyArray.length; i = i + 5) {
					await interaction.followUp({ embeds: replyArray.slice(i, i + 5), ephemeral: isPrivate });
				}
			}
		}
		else if (subCommand === 'pass') {
			await interaction.deferReply();
			const currentInit = await init_keyv.get(channelId);
			if (currentInit?.monster) {
				const [cardDrawn, outputText] = await drawMonsterCard(channelId, interaction.channel);
				await interaction.editReply({ embeds: [statusEmbed(cardDrawn.name, cardDrawn.effect, cardDrawn.severity, cardDrawn.color)], fetchReply: true }).then(msg => msg.pin('Monster Hunt Card Draw'));
				if (outputText) {
					await interaction.followUp(outputText);
				}
				const initText = await nextTurn(channelId, -1);
				await interaction.followUp({ content: initText });
			}
			else {
				await interaction.editReply('No monster is being fought in this channel!');
			}
		}
		else if (subCommand === 'redraw') {
			const currentInit = await init_keyv.get(channelId);
			if (currentInit?.monster) {
				const [cardDrawn, outputText] = await drawMonsterCard(channelId, interaction.channel);
				await interaction.reply({ embeds: [statusEmbed(cardDrawn.name, cardDrawn.effect, cardDrawn.severity, cardDrawn.color)], fetchReply: true }).then(msg => msg.pin('Monster Hunt Card Draw'));
				if (outputText) {
					await interaction.followUp(outputText);
				}
			}
			else {
				await interaction.reply('No monster is being fought in this channel!');
			}
		}
	},
};