const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { unpinChannelPins } = require('../functions/chat_utils');
const { tagInfoEmbed } = require('../components/embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('Add or show a tag')
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Search for Private or Public Tags?').setRequired(false))
				.addBooleanOption(option => option.setName('pin').setDescription('Pin the Tag temporarily?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Show tag info')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Search for Private or Public Tags?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addStringOption(option => option.setName('text').setDescription('Tag Content').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Make the tag Private?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('init')
				.setDescription('Adds a private init tag that displays whenever you enter init.')
				.addStringOption(option => option.setName('text').setDescription('Tag Content').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modify')
				.setDescription('Modify a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addStringOption(option => option.setName('text').setDescription('Tag Content').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Modify a Private or Public Tag?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Search for Private or Public Tags?').setRequired(false))
				.addBooleanOption(option => option.setName('admin').setDescription('Deletes a tag you don\'t own. [Admin Only]')),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Clear all pinned tags in a channel'),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(userID);
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'show' || subCommand === 'info') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const isPrivate = interaction.options.getBoolean('private') || false;
			const pinTag = interaction.options.getBoolean('pin') || false;

			if (tagName) {
				const query = `SELECT * from tags WHERE tags.name = ?${isPrivate ? ' AND tags.ownerId = ? AND tags.isPrivate = ?' : 'AND tags.isPrivate = ?'}`;
				const matchingTags = await db.query(query, {
					replacements: isPrivate ? [tagName, sqlUserID, isPrivate] : [tagName, isPrivate],
					type: QueryTypes.SELECT,
				});

				if (matchingTags?.length > 0) {
					const matchingTag = matchingTags[0];
					matchingTag.ownerId = BigInt(matchingTag.ownerId);
					const tagContent = matchingTag.content.replaceAll(/\\n/gm, '\n');
					if (subCommand === 'show') {
						const insertQuery = 'UPDATE tags SET usage_count = usage_count + 1 WHERE name = ? AND isPrivate = ? AND ownerId = ?';
						await db.query(insertQuery, {
							replacements: [matchingTag.name, matchingTag.isPrivate, matchingTag.ownerId],
							type: QueryTypes.UPDATE,
						});
						await interaction.reply(tagContent);
					}
					else {
						await interaction.reply({ embeds: [tagInfoEmbed(matchingTag)], allowedMentions: {} });
					}
					if (pinTag) {
						const message = await interaction.fetchReply();
						if (message) {
							await message.pin('Tag Pin Command');
						}
					}
				}
				else {
					await interaction.reply(`${isPrivate ? 'Private ' : ''}Tag ${tagName} does not exist!`);
				}
			}
		}
		else if (subCommand === 'add' || subCommand === 'modify') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const content = interaction.options.getString('text');
			const isPrivate = interaction.options.getBoolean('private') || false;

			const query = `SELECT * from tags WHERE tags.name = ?${isPrivate ? ' AND tags.ownerId = ? AND tags.isPrivate = ?' : 'AND tags.isPrivate = ?'}`;
			const matchingTags = await db.query(query, {
				replacements: isPrivate ? [tagName, sqlUserID, isPrivate] : [tagName, isPrivate],
				type: QueryTypes.SELECT,
			});

			if (subCommand === 'add') {
				if (matchingTags?.length > 0 || matchingTags.filter(tag => tag.isPrivate === isPrivate && tag.ownerId === sqlUserID)?.length) {
					await interaction.reply(`${isPrivate ? 'Private ' : ''}Tag ${tagName} already exists`);
					return;
				}
				else {
					await db.query('INSERT INTO tags(name, ownerId, content, isPrivate) VALUES (?, ?, ?, ?)', {
						replacements: [tagName, sqlUserID, content, isPrivate],
					});
				}
			}
			else if (subCommand === 'modify') {
				if (matchingTags?.length > 0) {
					await db.query('DELETE FROM tags WHERE tags.name = ? AND tags.ownerId = ? AND tags.isPrivate = ?', {
						replacements: [tagName, sqlUserID, isPrivate],
						type: QueryTypes.DELETE,
					});
					await db.query('INSERT INTO tags(name, ownerId, content, isPrivate) VALUES (?, ?, ?, ?)', {
						replacements: [tagName, sqlUserID, content, isPrivate],
					});
				}
				else {
					await interaction.reply(`${isPrivate ? 'Private ' : ''}Tag ${tagName} does not exist!`);
					return;
				}
			}

			interaction.reply(`${subCommand === 'modify' ? 'Modified' : 'Added'} Tag ${tagName}!`);
		}
		else if (subCommand === 'init') {
			const content = interaction.options.getString('text');
			await db.query('REPLACE INTO tags(name, ownerId, content, isPrivate) VALUES (?, ?, ?, ?)', {
				replacements: ['init', sqlUserID, content, true],
			});
			interaction.reply('Updated your init tag!');
		}
		else if (subCommand === 'delete') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const isPrivate = interaction.options.getBoolean('private') || false;
			const isAdmin = interaction.options.getBoolean('admin') || false;

			if (isAdmin && !interaction.member.roles.cache.some(role => role.name === 'Game Lead')) {
				await interaction.reply('Admin Deletes Require Game Lead Permissions!');
			}
			else {
				const query = `SELECT * from tags WHERE tags.name = ? ${!isAdmin ? 'AND tags.ownerId = ?' : ''} AND tags.isPrivate = ?`;
				const matchingTags = await db.query(query, {
					replacements: isAdmin ? [tagName, isPrivate] : [tagName, sqlUserID, isPrivate],
					type: QueryTypes.SELECT,
				});

				if (matchingTags?.length > 0) {
					await db.query(`DELETE FROM tags WHERE tags.name = ? ${!isAdmin ? 'AND tags.ownerId = ?' : ''} AND tags.isPrivate = ?`, {
						replacements: isAdmin ? [tagName, isPrivate] : [tagName, sqlUserID, isPrivate],
						type: QueryTypes.DELETE,
					});
					interaction.reply(`Deleted ${isPrivate ? 'private ' : ''}tag ${tagName}!`);
				}
				else {
					await interaction.reply(`There are no ${isPrivate ? 'Private ' : ''}Tags named ${tagName} that you own!`);
				}
			}
		}
		else if (subCommand === 'clear') {
			await unpinChannelPins(interaction.channel);
			await interaction.reply('Cleared all Rattie Pins!');
		}
	},
};
