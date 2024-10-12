const {SlashCommandBuilder} = require("discord.js");
const db = require("../database");
const {QueryTypes} = require("sequelize");
const {getMonster, drawDefaultLoot, drawMonsterCard, getValidMonsters, logDPR, getEncounterID, rollAC, getMonsterCards,
    concCheck
} = require("../functions/monster_utils");
const {monsterEmbed, lootEmbed, monsterAttackedEmbed, monsterDefeatedEmbed, statusEmbed} = require("../components/embeds");
const init_keyv = require("../keyv_stores/init_keyv");
const {newInit, nextTurn, uniqueUsers, getModifierString, getACModifiers, procModifiers, getModifiedRollCode,
    modifierCategories, modifierTypes, cullModifiers
} = require("../functions/init_utils");
const {unpinChannelPins} = require("../functions/chat_utils");
const {unweightedSelect, rollFromString } = require("../functions/roll_utils");
const { monster_color } = require('../components/constants');
const { toProperCase } = require('../functions/string_utils');

const validMonsters = getValidMonsters();
const monsterChoices = validMonsters.map(monster => {return {name:monster, value: monster}})
const categoryChoices = Object.entries(modifierCategories).map((value) => {return {name: value[1], value: value[0]}})
const typeChoices = Object.entries(modifierTypes).map(( value) => {return {name: value[1], value: value[0]}})

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
                .addIntegerOption(option => option.setName('count').setDescription('# of Strikes Rolled (Default 1)').setRequired(false)),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('redraw')
                .setDescription('Draw another monster card, using that one instead'),
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
            sortedMonsters.forEach(monster => {outputText+= `${monster.isPreview ? `*${monster.name}`: `**${monster.name}**`} [${monster.id}] - Scale ${monster.scale}${monster.isPreview ? ' [Preview]*': ''}\n`})
            interaction.reply(outputText);
        }
        else if (subCommand === 'show' || subCommand === 'fight') {
            let monster = getMonster(monsterName);
            if (monster) {
                let embed = monsterEmbed(monster)
                if (interaction.options.getSubcommand() === 'fight') {
                    if(monster.isPreview){
                        await interaction.reply("You cannot fight that monster yet!")
                    } else {
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
                            currentInit.looting = false;
                            currentInit.damageDealt = 0;
                            currentInit.dpr = [];
                            currentInit.monsterCards = monster && monster.attackCards ? monster.attackCards.map(card => {return {name: card.split(" | ")[0], effect: card.split(" | ")[1], severity: 'Monster', color: monster_color}}) : null;
                            currentInit.modifiers = [];
                            currentInit.modifiersApplied = 0;
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
                    }
                } else {
                    await interaction.reply({embeds: [embed]})
                }
            } else {
                await interaction.reply(`Invalid Monster Name "${monster}"`)
            }
        } else if (subCommand === 'loot') {
            let currentInit = await init_keyv.get(channelId);
            let monster = currentInit?.monster;
            let damageTaken = interaction.options.getInteger('damagetaken');
            let encounterId = await getEncounterID(channelId);

            if (monster) {
                if (!(currentInit.users.filter(usr => usr.userID === userID)) || currentInit.users.filter(usr => usr.userID === userID)?.length <= 0) {
                    await interaction.reply("You aren't in the current init!")
                } else if (!currentInit.looting) {
                    await interaction.reply("The monster has not yet been defeated!")
                } else {
                    let embed = lootEmbed(currentInit.monster.id, drawDefaultLoot())
                    await interaction.reply({embeds: [embed]})

                    console.log(damageTaken);
                    await db.query("REPLACE INTO participants (encounterId, userId, damageTaken) VALUES (?, ?, ?)", {
                        replacements: [encounterId, userID, damageTaken],
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
            let monsterHit = false;
            if(monster){
                let [flatMod, curseMod] = getACModifiers(currentInit.modifiers);
                let [baseAC, monsterCurseDieResult] = rollAC(monster.armorClass, (monster.curseDie || 5)+curseMod);
                if (subCommand === 'damage' || attackRoll >= parseInt(baseAC) + monsterCurseDieResult + parseInt(flatMod)) {
                    monsterHit = dmg > 0;
                    currentInit.damageDealt += dmg;
                    currentInit.dpr[currentInit.round] = currentInit.dpr[currentInit.round] ? currentInit.dpr[currentInit.round] + dmg : dmg
                }

                await interaction.reply({embeds: [monsterAttackedEmbed(monster, dmg, currentInit.damageDealt, attackRoll, baseAC, monsterCurseDieResult, monsterCurseDieSize, flatMod)]});

                if (monsterHit && concCheck(currentInit.damageDealt, monster.damageThreshold)) {
                    currentInit.looting = true;
                    currentInit.users = uniqueUsers(currentInit.users);
                    let userList = currentInit.users.map(usr => usr.userID);
                    await interaction.followUp({embeds: [monsterDefeatedEmbed(userList)]})
                    let encounterId = await getEncounterID(channelId);
                    let endTime = Date.now();
                    await db.query("UPDATE encounters SET rounds = ?, endTime = ?, status = ?, modifiersApplied = ? WHERE encounterId = ?", {
                        replacements: [currentInit.round, endTime, "Finished", currentInit.modifiersApplied, encounterId],
                        type: QueryTypes.UPDATE
                    })
                    await logDPR(encounterId, currentInit.dpr)
                } else if(subCommand === 'attack'){
                    let outputText = procModifiers(currentInit.modifiers, 'defend')
                    currentInit.modifiers = cullModifiers(currentInit.modifiers);
                    if(outputText){
                        await interaction.followUp(outputText);
                    }
                }
                await init_keyv.set(channelId, currentInit);
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        } else if (subCommand === 'modifier'){
            let modifierAmount = interaction.options.getInteger('amount');
            let modifierCategory = interaction.options.getString('category');
            let modifierType = interaction.options.getString('type');
            let modifierDuration = interaction.options.getInteger('duration') || 3;
            let modifierProcs = interaction.options.getInteger('procs') || null;
            let modifierNote = interaction.options.getString('note') || null;
            let currentInit = await init_keyv.get(channelId);

            let modifier = {id: currentInit.modifiersApplied+1, category: modifierCategory, type: modifierType, amount: modifierAmount, duration: modifierDuration, procs: modifierProcs, note: modifierNote}
            currentInit.modifiers.push(modifier)
            currentInit.modifiersApplied += 1;

            await init_keyv.set(channelId, currentInit);
            await interaction.reply(`Added ${getModifierString(modifier)}`)

            // modifier structure: {id, category, amount, type, duration, procs, note}[]
            // Each trigger of modifier: decrement modifier procs if extant, clear 0s AFTER RESOLUTION
            // Each /pass: decrement modifier durations if extant, clear 0s
            // Categories: Attack, Defense, Saves
            // Type: Flat, Curse Die Size (Curse)
            // +/- act as modifiers to value, Flat numbers set for everything but flat penalty
            // ID: Increment over time
            // Add # of modifiers dealt to end of monster data recording
        } else if (subCommand === 'status'){
            let currentInit = await init_keyv.get(channelId);
            let modifiers = currentInit.modifiers;
            let outputText = "Current Monster Modifiers:"
            if(currentInit.monster){
                if(modifiers?.length > 0){
                    for(let category of Object.keys(modifierCategories)){
                        let categoryModifiers = modifiers.filter(modifier => modifier.category === category).sort((a, b) => (a.id - b.id));
                        if(categoryModifiers?.length > 0){
                            let typeSums = {}
                            for (let modifier of categoryModifiers){
                                if(!typeSums[modifier.type]){
                                    typeSums[modifier.type] = modifier.amount;
                                } else {
                                    typeSums[modifier.type] += modifier.amount;
                                }
                            }
                            outputText += `\n\n**${modifierCategories[category]} Modifiers** (Rolling at 1d20+1d${typeSums['curse'] && typeSums['curse'] !== 0 ? Math.max(1, 6+typeSums['curse']) : 6}${typeSums['flat'] !== 0 ? (typeSums['flat'] > 0 ? `+${typeSums['flat']}` : `${typeSums['flat']}`) : ''})\n`
                            outputText += `${categoryModifiers.map(modifier => getModifierString(modifier)).join('\n')}`
                        }
                    }
                    outputText += `\n\nTotal Active Modifiers: ${modifiers.length}\nTotal Modifiers Applied This Fight: ${currentInit.modifiersApplied}`
                } else {
                    outputText = `No Current Modifiers!\nTotal Modifiers Applied This Fight: ${currentInit.modifiersApplied}`
                }
            } else {
                outputText = "No Monster being Fought!"
            }
            await interaction.reply(outputText)
        } else if (subCommand === 'cure'){
            let modifierID = interaction.options.getInteger('id');
            let currentInit = await init_keyv.get(channelId);
            let filteredModifiers = currentInit.modifiers.filter(modifier => modifier.id === modifierID).map(modifier => getModifierString(modifier))
            currentInit.modifiers = currentInit.modifiers.filter(modifier => modifier.id !== modifierID);
            await init_keyv.set(channelId, currentInit);
            await interaction.reply(`Removed Modifier${filteredModifiers.length > 1 ? 's:\n' : ': '}${filteredModifiers.join('\n')}`)
        } else if (subCommand === 'save' || subCommand === 'strike'){
            let count = interaction.options.getInteger('count') || 1;
            let outputText = ""
            let currentInit = await init_keyv.get(channelId);
            let monster = currentInit?.monster;
            let modifiers = currentInit.modifiers;
            if(monster){
                for(let i = 0; i < count; i++){
                    let rollArray = getModifiedRollCode(modifiers, subCommand);
                    let inputText = `${rollArray.slice(0, 3).join("+")}x${rollArray[3]}`
                    outputText += `${i > 0 ? '\n' : ''}${count > 1 ? `${subCommand.toProperCase()} #${i+1}: ` : ''}${rollFromString(inputText)}`;
                    let removedMods = procModifiers(modifiers, subCommand);
                    outputText += removedMods ? removedMods + '\n' : '';
                    modifiers = cullModifiers(modifiers);
                }
                await interaction.reply(outputText);
                await init_keyv.set(channelId, currentInit);
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        } else if (subCommand === 'cards'){
            const isPrivate = interaction.options.getBoolean('private') || false;
            let replyArray = getMonsterCards(monsterName);
            await interaction.reply({ embeds: replyArray.slice(0, 5), ephemeral: isPrivate });
            if (replyArray.length > 5) {
                for(let i = 5; i < replyArray.length; i = i + 5){
                    await interaction.followUp({ embeds: replyArray.slice(i, i + 5), ephemeral: isPrivate});
                }
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
        } else if (subCommand === 'redraw'){
            let currentInit = await init_keyv.get(channelId)
            if(currentInit?.monster){
                const [cardDrawn, outputText] = await drawMonsterCard(channelId, interaction.channel)
                await interaction.reply({embeds: [statusEmbed(cardDrawn.name, cardDrawn.effect, cardDrawn.severity, cardDrawn.color)], fetchReply: true}).then(msg => msg.pin('Monster Hunt Card Draw'))
                if (outputText) {
                    await interaction.followUp(outputText)
                }
            } else {
                await interaction.reply("No monster is being fought in this channel!")
            }
        }
    }
}