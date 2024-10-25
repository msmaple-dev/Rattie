const {weightedSelect, drawDeck, roll, unweightedSelect, rollString, arrayRoll } = require("./roll_utils");
const {toProperCase, camelizeKeys} = require("./string_utils");
const path = require("node:path");
const fs = require("node:fs");
const init_keyv = require("../keyv_stores/init_keyv");
const {unpinLatestEmbed} = require("./chat_utils");
const DPR = require("../tables/dpr");
const db = require("../database");
const {QueryTypes} = require("sequelize");
const Participants = require("../tables/participants");
const { statusEmbed } = require('../components/embeds');
const { monster_color } = require('../components/constants');

const monstersPath = path.join(__dirname.replace('\\functions', ''), 'monsters');
const monsterFiles = fs.readdirSync(monstersPath).filter(file => file.endsWith('.json'));
const monsters = {}

for (const file of monsterFiles) {
    const filePath = path.join(monstersPath, file);
    let monster = require(filePath);
    monster = camelizeKeys(monster)
    monsters[monster.id] = monster
}

const defaultLoot = {
    "Baseline Cert": 0.78,
    "A Bauble!": 0.10,
    "A Trinket!!": 0.08,
    "An Artifact!!!": 0.04,
}

const baubles = {
    "Two-Minds Earring": "You may take another Focus in Smarts",
    "Two-Sights Bracelet": "You may take another Focus in Talent",
    "Two-Bodies Bracelet": "You may take another Focus in Fitness",
    "Two-Hearts Locket": "You may take another Focus in Intuition",
    "Mole's Eye Ring": "You may walk through walls like they are molasses.",
    "Feather Tassel": "You may fly at 25 mph in 1 minute bursts.",
    "Spider Boots": "You can walk on walls and ceilings",
    "Cloak of Faeriekind": "You may grow translucent while still in shadow.",
    "Boots of Faeriekind": "Your steps make almost no sound.",
    "Ruby of the Red": "You may create small flames at will in your hand.",
    "Sapphire of the Blue": "You may create ice at will in your hand.",
    "Emerald of the Green": "You can create plant-life at will in your hand.",
    "Topaz of the Yellow": "You can create electric sparks at will in your hand.",
}

function getMonster(name) {
    return monsters[name.toLowerCase()];
}

function concCheck(damage, damageThreshold){
    if(Array.isArray(damageThreshold)){
        return damage >= unweightedSelect(damageThreshold);
    } else {
        return damage >= (damageThreshold + unweightedSelect([
            -8,
            -5,
            -4,
            -3,
            -2,
            -1,
            0,
            0,
            0,
            1,
            2,
            3,
            5,
            8,
            10
        ]))
    }
}

function getValidMonsters(){
    return Object.keys(monsters)
}

function drawDefaultLoot() {
    let lootRoll = `${weightedSelect(defaultLoot)}`;
    if(lootRoll.includes('Bauble')){
        lootRoll += `\n${unweightedSelect(Object.entries(baubles)).join(": ")}`
    }
    return lootRoll;
}

async function drawMonsterCard(channelId, channel, clearLast = true){
    let currentInit = await init_keyv.get(channelId);
    let outputText = ""
    let monsterCards = currentInit.monsterCards;
    if(monsterCards.filter(card => !card.used).length < 1){
        outputText = "Shuffling deck..."
    }
    let cardDrawn = drawDeck(monsterCards)[0];
    if(clearLast){unpinLatestEmbed(channel)}
    await init_keyv.set(channelId, currentInit);
    return [cardDrawn, outputText]
}

function attackCardsToObject(attackCards){
    return attackCards ? attackCards.map(card => {return {name: card.split(" | ")[0], effect: card.split(" | ")[1], severity: 'Monster', color: monster_color}}) : null
}

function getMonsterCards(monsterName){
    let monster = getMonster(monsterName);
    let monsterCards = attackCardsToObject(monster.attackCards);
    let embedArray = [];
    for (let selectedCard of monsterCards) {
        let embed = statusEmbed(selectedCard.name, selectedCard.effect, selectedCard.severity, selectedCard.color);
        embedArray.push(embed);
    }
    return embedArray;
}

function rollAC(baseAC, curseDie = 5){
    if(Array.isArray(baseAC)){
        return [arrayRoll(baseAC), roll(curseDie)]
    } else {
        return [baseAC, roll(curseDie)];
    }
}

async function logDPR(encounterId, dprArray){
    let dprValues = dprArray?.slice(1).map((dpr, index) => {return {encounterId: encounterId, round: index, damage: dpr}})
    await DPR.bulkCreate(dprValues)
}

async function getEncounterID(channelId){
    let encounterId = await db.query("SELECT encounterId FROM encounters WHERE channelId = ? AND startTime < ? ORDER BY startTime DESC LIMIT 1", {
        replacements: [channelId, Date.now()],
        type: QueryTypes.SELECT
    })
    return encounterId[0]?.encounterId || false;
}

async function initializeParticipants(encounterId, users){
    let userValues = users.map(usr => {return {encounterId: encounterId, userId: usr.userID, damageTaken: null}})
    await Participants.bulkCreate(userValues);
}

module.exports = {drawMonsterCard, drawDefaultLoot, getMonster, getValidMonsters, logDPR, getEncounterID, initializeParticipants, rollAC, getMonsterCards, attackCardsToObject, concCheck}