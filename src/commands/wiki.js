const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonStyle } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { wikiEmbed, wikiListEmbed } = require('../components/embeds');

async function findWiki(wikiName, getEmbed = true) {
	const wikis = await db.query('SELECT * FROM wikis WHERE name = ?', {
		replacements: [wikiName],
		type: QueryTypes.SELECT,
	});
	if (wikis && wikis?.length > 0) {
		if (getEmbed) {
			return wikiEmbed({ name: wikiName, ...wikis[0] });
		}
		else {
			return wikis[0];
		}
	}
	else {
		return false;
	}
}

const fieldChoices = [
	{ name: 'name', value: 'name' },
	{ name: 'warlockname', value: 'warlockname' },
	{ name: 'pronouns', value: 'pronouns' },
	{ name: 'quote', value: 'quote' },
	{ name: 'about', value: 'about' },
	{ name: 'age', value: 'age' },
	{ name: 'faction', value: 'faction' },
	{ name: 'renown', value: 'renown' },
	{ name: 'scent', value: 'scent' },
	{ name: 'appearance', value: 'appearance' },
	{ name: 'image', value: 'image' },
	{ name: 'source', value: 'source' },
	{ name: 'icon', value: 'icon' },
	{ name: 'abilities', value: 'abilities' },
	{ name: 'color', value: 'color' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('Lets you modify or view Warlock Wikis')
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View a specific Warlock Wiki')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all wikis'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new Warlock Wiki')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modify')
				.setDescription('Modify a specific Wiki one field at a time or all at once, adding a field if it doesn\'t exist')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true))
				.addStringOption(option => option.setName('warlockname').setDescription('Warlock Name').setRequired(false))
				.addStringOption(option => option.setName('pronouns').setDescription('Your Warlock\'s pronouns').setRequired(false))
				.addStringOption(option => option.setName('quote').setDescription('Warlock Quote').setRequired(false))
				.addStringOption(option => option.setName('about').setDescription('General Info on the Warlock').setRequired(false))
				.addStringOption(option => option.setName('age').setDescription('Age').setRequired(false))
				.addStringOption(option => option.setName('scale').setDescription('Scale (Apparent and Real)').setRequired(false))
				.addStringOption(option => option.setName('faction').setDescription('What Faction the Warlock is Aligned With').setRequired(false))
				.addStringOption(option => option.setName('renown').setDescription('Your Warlock\'s renown, if relevant').setRequired(false))
				.addStringOption(option => option.setName('scent').setDescription('The Warlock\'s Scent').setRequired(false))
				.addStringOption(option => option.setName('appearance').setDescription('Warlock Appearance').setRequired(false))
				.addStringOption(option => option.setName('image').setDescription('Appearance Image URL').setRequired(false))
				.addStringOption(option => option.setName('source').setDescription('Appearance Image Source URL').setRequired(false))
				.addStringOption(option => option.setName('icon').setDescription('Icon Image URL').setRequired(false))
				.addStringOption(option => option.setName('abilities').setDescription('Info on the Warlock\'s Abilities').setRequired(false))
				.addStringOption(option => option.setName('color').setDescription('The Card\'s Border Color').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a warlock Wiki')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('rename')
				.setDescription('Rename a warlock Wiki')
				.addStringOption(option => option.setName('name').setDescription('Old Wiki Name').setRequired(true))
				.addStringOption(option => option.setName('newname').setDescription('New Wiki Name').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('length')
				.setDescription('Get the length of all fields in a warlock wiki')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('drop')
				.setDescription('Drop a field from a wiki')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true))
				.addStringOption(option => option.setName('field').setDescription('Field to Drop').addChoices(...fieldChoices).setRequired(true)),
		).addSubcommand(subcommand =>
			subcommand
				.setName('showcase')
				.setDescription('Toggles if a given wiki you own is available for use in the showcase')
				.addStringOption(option => option.setName('name').setDescription('Wiki Name').setRequired(true))
				.addBooleanOption(option => option.setName('enabled').setDescription('Is the wiki available for the Showcase?').setRequired(true)),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(userID);
		const wikiName = interaction.options.getString('name')?.replace(/[^a-zA-Z0-9]/g, '')?.toLowerCase();
		if (interaction.options.getSubcommand() === 'show' || interaction.options.getSubcommand() === 'length') {
			const lengthCheck = interaction.options.getSubcommand() === 'length';
			const foundWiki = await findWiki(wikiName, !lengthCheck);
			if (foundWiki) {
				if (lengthCheck) {
					const wikiProperties = Object.entries(foundWiki);
					const propertyLengths = [];
					const invalidFields = ['id', 'ownerId', 'showcaseUses', 'showcaseEnabled'];
					for (const [property, value] of wikiProperties) {
						if (value && !invalidFields.includes(property)) {
							propertyLengths.push([property, value?.length]);
						}
					}
					propertyLengths.sort((a, b) => (b[1] - a[1]));
					let outputString = `__**Length of Fields in Wiki "${wikiName}"**__\n`;
					const checkedFields = ['warlockName', 'quote', 'about', 'faction', 'appearance', 'abilities', 'scent'];
					const totalSum = propertyLengths.reduce((accumulator, currentVal) => (accumulator + currentVal[1]), 0);
					const checkedPropertyLength = propertyLengths.filter((property => checkedFields.includes(property[0]))).reduce((accumulator, currentVal) => (accumulator + currentVal[1]), 0);
					outputString += propertyLengths.map((property) => (`${checkedFields.includes(property[0]) ? `**${property[0]}**` : property[0]}: ${property[1]}`)).join('\n');
					outputString += `\n**Total Length:** ${totalSum}\nLength of Checked Fields for Daily Showcase: ${checkedPropertyLength} (${checkedPropertyLength > 450 ? 'V' : 'Inv'}alid Choice for Wiki of the Day)`;
					await interaction.reply(outputString);
				}
				else {
					await interaction.reply({ embeds: [foundWiki] });
				}
			}
			else {
				await interaction.reply(`No wikis named ${wikiName}`);
			}
		}
		else if (interaction.options.getSubcommand() === 'list') {
			const selectQuery = 'SELECT name, warlockName FROM wikis ORDER BY name LIMIT ? OFFSET ?';
			let currentPage = 0;
			const selectLimit = 25;
			let pageWikis = await db.query(selectQuery, {
				replacements: [selectLimit, currentPage * selectLimit],
				type: QueryTypes.SELECT,
			});
			const wikiCountQuery = await db.query('SELECT COUNT(id) FROM wikis', {
				type: QueryTypes.SELECT,
			});
			const wikiCount = wikiCountQuery[0]['COUNT(id)'];
			const prev = new ButtonBuilder()
				.setCustomId('prev')
				.setEmoji({ name: '⬅' })
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage <= 0);
			const next = new ButtonBuilder()
				.setCustomId('next')
				.setEmoji({ name: '➡' })
				.setStyle(ButtonStyle.Primary)
				.setDisabled((currentPage + 1) * selectLimit > (wikiCount));
			let selectOptions = pageWikis.map((wiki) => new StringSelectMenuOptionBuilder()
				.setLabel(`${wiki.warlockName ? `${wiki.name} - ${wiki.warlockName}` : wiki.name}`)
				.setValue(wiki.name),
			);
			const select = new StringSelectMenuBuilder()
				.setCustomId('select')
				.setPlaceholder('Select a wiki listed')
				.setOptions(selectOptions);
			let selectRow = new ActionRowBuilder().addComponents(select);
			let buttonRow = new ActionRowBuilder().addComponents(prev, next);
			let wikiList = wikiListEmbed(pageWikis, currentPage, wikiCount, selectLimit);

			const response = await interaction.reply({ embeds: [wikiList], components: [selectRow, buttonRow], ephemeral: true });

			const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 120_000 });
			selectCollector.on('collect', async i => {
				const foundWiki = await findWiki(i.values[0]);
				if (foundWiki) {
					await i.reply({ embeds: [foundWiki] });
				}
				else {
					await i.reply(`No wikis named ${foundWiki}`);
				}
			});

			const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120_000 });
			buttonCollector.on('collect', async i => {
				currentPage += (i.customId === 'next' ? 1 : -1);
				pageWikis = await db.query(selectQuery, {
					replacements: [selectLimit, currentPage * selectLimit],
					type: QueryTypes.SELECT,
				});
				wikiList = wikiListEmbed(pageWikis, currentPage, wikiCount, selectLimit);
				prev.setDisabled(currentPage <= 0);
				next.setDisabled((currentPage + 1) * selectLimit > (wikiCount));
				selectRow = new ActionRowBuilder().addComponents(select);
				buttonRow = new ActionRowBuilder().addComponents(prev, next);
				selectOptions = pageWikis.map((wiki) => new StringSelectMenuOptionBuilder()
					.setLabel(`${wiki.warlockName ? `${wiki.name} - ${wiki.warlockName}` : wiki.name}`)
					.setValue(wiki.name),
				);
				select.setOptions(selectOptions);
				await i.update({ embeds: [wikiList], components: [selectRow, buttonRow], ephemeral: true });
			});
		}
		else if (interaction.options.getSubcommand() === 'modify') {
			const warlockName = interaction.options.getString('warlockname') || null;
			const quote = interaction.options.getString('quote') || null;
			const age = interaction.options.getString('age') || null;
			const about = interaction.options.getString('about') || null;
			const scale = interaction.options.getString('scale') !== null ? interaction.options.getString('scale') : null;
			const faction = interaction.options.getString('faction') || null;
			const image = interaction.options.getString('image') || null;
			const source = interaction.options.getString('source') || null;
			const icon = interaction.options.getString('icon') || null;
			const appearance = interaction.options.getString('appearance') || null;
			const abilities = interaction.options.getString('abilities') || null;
			const color = interaction.options.getString('color') || null;
			const pronouns = interaction.options.getString('pronouns') || null;
			const scent = interaction.options.getString('scent') || null;
			const renown = interaction.options.getString('renown') !== null ? interaction.options.getString('renown') : null;
			const updatableValues = [warlockName, quote, about, age, scale, faction, appearance, image, source, icon, abilities, color, pronouns, scent, renown];
			const updatableFields = ['warlockName', 'quote', 'about', 'age', 'scale', 'faction', 'appearance', 'image', 'source', 'icon', 'abilities', 'color', 'pronouns', 'scent', 'renown'];
			const setFields = updatableValues.map((value, index) => value && `${updatableFields[index]} = ?`).filter(a => a !== null).join(', ');

			if (updatableValues.filter(a => a)?.length <= 0) {
				await interaction.reply('No valid fields given!');
				return;
			}

			if (interaction.options.getSubcommand() === 'modify') {
				const existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
					replacements: [sqlUserID, wikiName],
					type: QueryTypes.SELECT,
				});
				if (existingOwnedWikis?.length > 0) {
					await db.query(`UPDATE wikis
                                    SET ${setFields}
                                    WHERE ownerId = ?
                                      AND name = ?`, {
						replacements: [...updatableValues.filter(a => a !== null), sqlUserID, wikiName],
						type: QueryTypes.UPDATE,
					});
					await interaction.reply(`Modified wiki ${wikiName}!`);
				}
				else {
					await interaction.reply(`No wikis you own are named ${wikiName}!`);
				}
			}
		}
		else if (interaction.options.getSubcommand() === 'add') {
			const existingWikis = await db.query('SELECT * FROM wikis WHERE name = ?', {
				replacements: [wikiName],
				type: QueryTypes.SELECT,
			});
			if (existingWikis?.length > 0) {
				await interaction.reply({
					content: `The wiki ${wikiName} already exists, owned by <@${BigInt(existingWikis[0].ownerId)}>!`,
					allowedMentions: {},
				});
			}
			else {
				await db.query('INSERT INTO wikis(ownerId, name) VALUES (?, ?)', {
					replacements: [sqlUserID, wikiName],
					type: QueryTypes.INSERT,
				});
				await interaction.reply(`Added wiki ${wikiName}!`);
			}
		}
		else if (interaction.options.getSubcommand() === 'delete') {
			const existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
				replacements: [sqlUserID, wikiName],
				type: QueryTypes.SELECT,
			});

			if (existingOwnedWikis?.length > 0) {
				await db.query('DELETE FROM wikis WHERE ownerId = ? AND name = ?', {
					replacements: [sqlUserID, wikiName],
					type: QueryTypes.DELETE,
				});
				await interaction.reply(`Deleted wiki ${wikiName}`);
			}
			else {
				await interaction.reply(`No wikis you own are named ${wikiName}!`);
			}
		}
		else if (interaction.options.getSubcommand() === 'rename') {
			const newWikiName = interaction.options.getString('newname')?.replace(/[^a-zA-Z0-9]/g, '')?.toLowerCase() || null;
			const existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
				replacements: [sqlUserID, wikiName],
				type: QueryTypes.SELECT,
			});

			if (newWikiName && existingOwnedWikis?.length > 0) {
				await db.query('UPDATE wikis SET name = ? WHERE ownerId = ? AND name = ?', {
					replacements: [newWikiName, sqlUserID, wikiName],
					type: QueryTypes.DELETE,
				});
				await interaction.reply(`Renamed wiki ${wikiName} to ${newWikiName}`);
			}
			else {
				await interaction.reply(`No wikis you own are named ${wikiName}!`);
			}
		}
		else if (interaction.options.getSubcommand() === 'drop') {
			const existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
				replacements: [sqlUserID, wikiName],
				type: QueryTypes.SELECT,
			});

			const field = interaction.options.getString('field');

			if (field && existingOwnedWikis?.length > 0) {
				const query = 'UPDATE WIKIS SET ? = null WHERE ownerId = ? AND name = ?';
				await db.query(query, {
					replacements: [field, sqlUserID, wikiName],
					type: QueryTypes.DELETE,
				});
				await interaction.reply(`Dropped field ${field} from ${wikiName}`);
			}
			else {
				await interaction.reply(`No wikis you own are named ${wikiName}!`);
			}
		}
		else if (interaction.options.getSubcommand() === 'showcase') {
			const existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
				replacements: [sqlUserID, wikiName],
				type: QueryTypes.SELECT,
			});

			const enabled = interaction.options.getBoolean('enabled');

			if (existingOwnedWikis?.length > 0) {
				const query = 'UPDATE WIKIS SET showcaseEnabled = ? WHERE ownerId = ? AND name = ?';
				await db.query(query, {
					replacements: [enabled, sqlUserID, wikiName],
					type: QueryTypes.DELETE,
				});
				await interaction.reply(`${enabled ? 'Enabled' : 'Disabled'} Showcase Display for Wiki ${wikiName}`);
			}
			else {
				await interaction.reply(`No wikis you own are named ${wikiName}!`);
			}
		}
	},
};
