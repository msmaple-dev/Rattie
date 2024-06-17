const {SlashCommandBuilder} = require("discord.js");
const db = require("../database");
const {QueryTypes} = require("sequelize");
const {getMonster, drawDefaultLoot, drawMonsterCard, getValidMonsters, logDPR, getEncounterID} = require("../functions/monster_utils");
const {monsterEmbed, lootEmbed, monsterAttackedEmbed, monsterDefeatedEmbed, statusEmbed} = require("../components/embeds");
const init_keyv = require("../keyv_stores/init_keyv");
const {newInit, nextTurn, uniqueUsers} = require("../functions/init_utils");
const {unpinChannelPins} = require("../functions/chat_utils");
const {unweightedSelect} = require("../functions/roll_utils");

const validMonsters = getValidMonsters();
const monsterChoices = validMonsters.map(monster => {return {name:monster, value: monster}})

module.exports = {
    data: new SlashCommandBuilder()
        .setName('monster')
        .setDescription('Lets you fight or view Monster Info')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Shows all monsters available to fight in Cursedice')
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
                .addIntegerOption(option => option.setName('endhp').setDescription('Your ending hp in the fight').setRequired(true)),
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
        ),
    async execute(interaction) {
        const userID = interaction.user.id;
        const sqlID = BigInt(userID);
        const channelId = interaction.channelId;
        const monsterName = interaction.options.getString('name');
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'list'){
            let outputText = "__**List of Fightable Monsters**__\n"
            let sortedMonsters = validMonsters.map(monsterId => getMonster(monsterId)).sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.scale - b.scale)
            sortedMonsters.forEach(monster => {outputText+= `**${monster.name}** [${monster.id}] - Scale ${monster.scale}\n`})
            interaction.reply(outputText);
        }
        else if (subCommand === 'show' || subCommand === 'fight') {
            let monster = getMonster(monsterName);
            if (monster) {
                let embed = monsterEmbed(monster)
                if (interaction.options.getSubcommand() === 'fight') {
                    if(await init_keyv.has(channelId)){
                        let currentInit = await init_keyv.get(channelId);
                        currentInit.users.push({
                            userID: userID,
                            identifier: `${monster.name}'s Draw`,
                            initVal: 100,
                            decks: {}
                        })
                        currentInit.users.push({userID: userID, identifier: `${monster.name} Acts`, initVal: 1, decks: {}})
                        currentInit.monster = monster;
                        await init_keyv.set(channelId, currentInit)
                    }
                    else {
                        let startingInit = newInit([{
                            userID: userID,
                            identifier: `${monster.name}'s Draw`,
                            initVal: 100,
                            decks: {}
                        }, {userID: userID, identifier: `${monster.name} Acts`, initVal: 1, decks: {}}], monster)
                        await init_keyv.set(channelId, startingInit)
                    }

                    // Checks if channel type is a thread, then logs if it is
                    if (interaction.channel?.type === 11) {
                        await db.query("INSERT INTO encounters (channelId, rounds, startTime, endTime, monster) VALUES (?, ?, ?, ?, ?)", {
                            replacements: [channelId, null, Date.now(), null, monster.id],
                            type: QueryTypes.INSERT,
                        })
                    }
                    await interaction.reply(`Started new fight against ${monster.name}, managed by <@${userID}>!`)
                    await interaction.followUp({embeds: [embed]}).then(msg => msg.pin('Monster Hunt Pin'))
                } else {
                    await interaction.reply({embeds: [embed]})
                }
            } else {
                await interaction.reply(`Invalid Monster Name "${monster}"`)
            }
        } else if (subCommand === 'loot') {
            let currentInit = await init_keyv.get(channelId);
            let monster = currentInit?.monster;
            let endHP = interaction.options.getInteger('endhp');
            let encounterId = await getEncounterID(channelId);

            if (monster) {
                if (!(currentInit.users.filter(usr => usr.userID === userID)) || currentInit.users.filter(usr => usr.userID === userID)?.length <= 0) {
                    await interaction.reply("You aren't in the current init!")
                } else if (!currentInit.looting) {
                    await interaction.reply("The monster has not yet been defeated!")
                } else {
                    let embed = lootEmbed(currentInit.monster.id, drawDefaultLoot())
                    await interaction.reply({embeds: [embed]})

                    await db.query("REPLACE INTO participants (encounterId, userId, endHP) VALUES (?, ? , ?)", {
                        replacements: [encounterId, userID, endHP],
                        type: QueryTypes.INSERT
                    })

                    currentInit.users = currentInit.users.filter(usr => usr.userID !== userID)
                    if (currentInit.users.length > 0) {
                        await init_keyv.set(channelId, currentInit);
                    } else {
                        await init_keyv.delete(channelId)
                        await unpinChannelPins(interaction.channel)
                        await interaction.followUp("Everyone has rolled loot! GG!")
                    }
                }
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        } else if (subCommand === 'attack' || subCommand === 'damage') {
            let currentInit = await init_keyv.get(channelId);
            let attackRoll = interaction.options.getInteger('roll') || null;
            let dmg = interaction.options.getInteger('dmg');
            let monster = currentInit?.monster;
            if(monster){
                let monsterAC = unweightedSelect(monster.armorClass)
                let monsterHP = unweightedSelect(monster.damageThreshold)

                if (subCommand === 'damage' || attackRoll >= monsterAC) {
                    currentInit.damageDealt += dmg;
                    currentInit.dpr[currentInit.round] = currentInit.dpr[currentInit.round] ? currentInit.dpr[currentInit.round] + dmg : dmg
                }

                await interaction.reply({embeds: [monsterAttackedEmbed(monster, dmg, currentInit.damageDealt, attackRoll, monsterAC)]});

                if (currentInit.damageDealt >= monsterHP) {
                    currentInit.looting = true;
                    currentInit.users = uniqueUsers(currentInit.users);
                    let userList = currentInit.users.map(usr => usr.userID);
                    await interaction.followUp({embeds: [monsterDefeatedEmbed(userList)]})
                    let encounterId = await getEncounterID(channelId);
                    let endTime = Date.now();
                    await db.query("UPDATE encounters SET rounds = ?, endTime = ?, status = ? WHERE encounterId = ?", {
                        replacements: [currentInit.round, endTime, "Finished", encounterId],
                        type: QueryTypes.UPDATE
                    })
                    await logDPR(encounterId, currentInit.dpr)
                }

                await init_keyv.set(channelId, currentInit);
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        } else if (subCommand === 'pass') {
            let currentInit = await init_keyv.get(channelId)
            if(currentInit?.monster){
                const [cardDrawn, outputText] = await drawMonsterCard(channelId, interaction.channel)
                await interaction.reply({embeds: [statusEmbed(cardDrawn.name, cardDrawn.effect, cardDrawn.severity, cardDrawn.color)], fetchReply: true}).then(msg => msg.pin('Monster Hunt Card Draw'))
                if (outputText) {
                    await interaction.followUp(outputText)
                }
                let initText = await nextTurn(channelId, -1);
                await interaction.followUp({content: initText})
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        }
    }
}