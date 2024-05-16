const Sequelize = require('sequelize');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');

// Setup Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const tablesPath = path.join(__dirname, 'tables');
const tablesFiles = fs.readdirSync(tablesPath).filter(file => file.endsWith('.js'));

// const keyvPath = path.join(__dirname, 'keyv_stores');
// const keyvFiles = fs.readdirSync(tablesPath).filter(file => file.endsWith('.js'));

for (const file of tablesFiles) {
	const filePath = path.join(tablesPath, file);
	const table = require(filePath);
	table.sync();
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		console.log(`Registered Command: ${command.data.name}`)
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}



// for (const file of keyvFiles) {
// 	const filePath = path.join(tablesPath, file);
// 	const keyv = require(filePath);
// }

client.cooldowns = new Collection();


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, 0);
	}

	const now = Date.now();
	let timestamp = cooldowns.get(command.data.name);
	const cooldownAmount = (command.cooldown ?? 0) * 1000;

	if (timestamp) {
		const expirationTime = timestamp + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamp = now;
	setTimeout(() => cooldowns.delete(command.data.name), cooldownAmount);


	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log in to Discord with your client's token
client.login(token);