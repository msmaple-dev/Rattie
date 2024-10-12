const {weightedSelect, drawDeck, roll, unweightedSelect } = require("./roll_utils");
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
    "1 * Cert": 0.78,
    "A Bauble!": 0.10,
    "A Trinket!!": 0.08,
    "An Artifact!!!": 0.04,
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
    return `${weightedSelect(defaultLoot)}`
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
    return [baseAC, roll(curseDie)];
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