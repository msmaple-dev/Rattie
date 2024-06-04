const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { wikiEmbed } = require('../components/embeds');

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
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(interaction.user.id);
		const wikiName = interaction.options.getString('name').toLowerCase();
		if (interaction.options.getSubcommand() === 'show') {
			let wikis = await db.query('SELECT * FROM wikis WHERE name = ?', {
				replacements: [wikiName],
				type: QueryTypes.SELECT,
			});
			if (wikis && wikis?.length > 0) {
				const embed = wikiEmbed({name: wikiName, ...wikis[0]});
				await interaction.reply({ embeds: [embed] });
			}
			else {

				await interaction.reply(`No wikis named ${wikiName}`);
			}
		}
		else if (interaction.options.getSubcommand() === 'modify') {
			let warlockName = interaction.options.getString('warlockname') || null;
			let quote = interaction.options.getString('quote') || null;
			let age = interaction.options.getString('age') || null;
			let about = interaction.options.getString('about') || null;
			let scale = interaction.options.getString('scale') !== null ? interaction.options.getString('scale') : null;
			let faction = interaction.options.getString('faction') || null;
			let image = interaction.options.getString('image') || null;
			let source = interaction.options.getString('source') || null;
			let icon = interaction.options.getString('icon') || null;
			let appearance = interaction.options.getString('appearance') || null;
			let abilities = interaction.options.getString('abilities') || null;
			let color = interaction.options.getString('color') || null;
			let pronouns = interaction.options.getString('pronouns') || null;
			let scent = interaction.options.getString('scent') || null;
			let renown = interaction.options.getString('renown') !== null ? interaction.options.getString('renown') : null;
			let updatableValues = [warlockName, quote, about, age, scale, faction, appearance, image, source, icon, abilities, color, pronouns, scent, renown];
			let updatableFields = ['warlockName', 'quote', 'about', 'age', 'scale', 'faction', 'appearance', 'image', 'source', 'icon', 'abilities', 'color', 'pronouns', 'scent', 'renown'];
			let setFields = updatableValues.map((value, index) => value && `${updatableFields[index]} = ?`).filter(a => a !== null).join(', ');

			if (updatableValues.filter(a => a)?.length <= 0) {
				await interaction.reply(`No valid fields given!`);
				return;
			}

			if (interaction.options.getSubcommand() === 'modify') {
				let existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
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
			let existingWikis = await db.query('SELECT * FROM wikis WHERE name = ?', {
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
			let existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
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
			let newWikiName = interaction.options.getString('newname') || null;
			let existingOwnedWikis = await db.query('SELECT * FROM wikis WHERE ownerId = ? AND name = ?', {
				replacements: [sqlUserID, wikiName],
				type: QueryTypes.SELECT,
			});

			if (existingOwnedWikis?.length > 0) {
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
	},
};
