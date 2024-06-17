const {weightedSelect, drawDeck} = require("./roll_utils");
const {toProperCase, camelizeKeys} = require("./string_utils");
const path = require("node:path");
const fs = require("node:fs");
const init_keyv = require("../keyv_stores/init_keyv");
const {unpinLatestEmbed} = require("./chat_utils");
const DPR = require("../tables/dpr");
const db = require("../database");
const {QueryTypes} = require("sequelize");
const Participants = require("../tables/participants");

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

async function logDPR(encounterId, dprArray){
    let dprValues = dprArray.map((dpr, index) => {return {encounterId: encounterId, round: index+1, damage: dpr}})
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
    let userValues = users.map(usr => {return {encounterId: encounterId, userId: usr.userID, endHP: null}})
    await Participants.bulkCreate(userValues);
}

module.exports = {drawMonsterCard, drawDefaultLoot, getMonster, getValidMonsters, logDPR, getEncounterID, initializeParticipants}