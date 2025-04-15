const { camelizeKeys } = require('./string_utils');
const path = require('node:path');
const fs = require('node:fs');
const { unweightedSelect, roll } = require('./roll_utils');
const { getTotalInitScale, nextTurn } = require('./init_utils');
const init_keyv = require('../keyv_stores/init_keyv');
const db = require('../database');
const { QueryTypes } = require('sequelize');

const raidPath = path.join(__dirname.replace(/[\\/]+functions/, ''), 'raids');
const raidTypePath = path.join(raidPath, 'raid_types');
const raidMonsterPath = path.join(raidPath, 'raid_monsters');
const raidTypeFiles = fs.readdirSync(raidTypePath).filter(file => file.endsWith('.json'));
const raidMonsterFiles = fs.readdirSync(raidMonsterPath).filter(file => file.endsWith('.json'));
const raids = {};
const raidMonsters = {};

const raidScaleProgressions = {
	normal: [0.5, 1, 1.25, 1.25, 1.5, 1.5, 2],
};

const defaultModifiers = {
	negative: [
		'All squares are Flaming.',
		'Players have halved Stride distance and cannot step.',
		'Ranged Strikes targeting Monsters further than 3 squares away have -3 Accuracy.',
		'Players take 3 damage when using Boosts, Banes, or Utilities.',
		'Players must make a DC15 Save at the end of their turn vs a Burn status.',
		'Players must make a DC15 Save at the end of their turn vs a Shock status.',
		'Monsters move twice as many squares.',
		'Strikes cannot affect more than one target. Two-Action Strikes cannot affect more than two targets.',
		'Players cannot treat any character as an Ally and cannot benefit from the effects of other Players.',
		'Players cannot clear Statuses.',
	],
	positive: [
		'Players have +2 value on Strikes.',
		'If a Strike deals Knockback, it always results in a Wallbang.',
		'Monsters have -3 to Saves.',
		'Players heal 3 on a successful Strike.',
		'Players heal 3 at the end of their turn.',
		'Players take 2 less damage from Monster actions.',
		'All Players have Show-Off, they gain 1 Panache at the start of their turn.',
		'Monsters move half as much.',
	],
};

for (const file of raidTypeFiles) {
	const filePath = path.join(raidTypePath, file);
	let raid = require(filePath);
	raid = camelizeKeys(raid);
	raids[raid.id] = raid;
}

for (const file of raidMonsterFiles) {
	const filePath = path.join(raidMonsterPath, file);
	let monster = require(filePath);
	monster = camelizeKeys(monster);
	raidMonsters[monster.id] = monster;
}

function getRaid(id) {
	return raids[id.toLowerCase()];
}

function getRaidMonster(id) {
	return raidMonsters[id.toLowerCase()];
}

function getValidRaids() {
	return Object.keys(raids);
}

function getValidRaidMonsters() {
	return Object.keys(raidMonsters);
}

function getMonstersForRaid(raid) {
	const monstersForRaid = {};
	for (const monster of raid.monsters) {
		const monsterData = getRaidMonster(monster.replace('.js', ''));
		monstersForRaid[monsterData.id] = monsterData;
	}
	return monstersForRaid;
}


function generateFloor(currentInit, rooms = 2) {
	currentInit.currentRoom = {};
	currentInit.currentTurn = 0;
	currentInit.currentRound = 0;
	const totalInitScale = getTotalInitScale(currentInit);
	currentInit.roomNumber++;
	for (let i = 0; i < rooms; i++) {
		const room = {
			monsters: generateRoomMonsters(currentInit.raid, currentInit.roomNumber, totalInitScale),
			modifiers: generateRoomModifiers(currentInit.raid),
		};
		currentInit.raidFloor.push(room);
		currentInit.roomDescriptions.push(`Room ${i + 1} (Level ${currentInit.roomNumber}, Scale ${totalInitScale}): ${getMonsterString(room.monsters)}${room.modifiers ? '\n**Modifiers**' +
			'- ' + room.modifiers.join('\n- ') : ''}`);
	}
	return 'Choose One with ``/raid continue``:\n' + currentInit.roomDescriptions.join('\nOR\n') + '\n OR do ``/raid end`` to end the raid.';
}

function getMonsterString(room) {
	return Object.entries(room).map(([monster, count]) => count + ' ' + monster).join(', ');
}

async function goToRoom(currentInit, roomId, channelId) {
	currentInit.currentRoom = currentInit.raidFloor[roomId - 1];
	currentInit.currentFloor = [];
	currentInit.roomDescriptions = [];
	await init_keyv.set(channelId, currentInit);
	return await nextTurn(channelId);
}

function generateRoomModifiers(raid) {
	const hasModifier = roll(2) > 1;
	if (hasModifier) {
		const uniqueMods = raid.uniqueRoomModifiers;
		const positives = defaultModifiers.positive.concat(uniqueMods?.positive || []);
		const negatives = defaultModifiers.negative.concat(uniqueMods?.positive || []);
		return [unweightedSelect(positives), unweightedSelect(negatives)];
	}
	else {
		return [];
	}
}

function generateRoomMonsters(raid, roomNum, raidScale) {
	const isMiniBoss = raid.miniBosses.includes(roomNum);
	const isBoss = raid.bosses.includes(roomNum);

	const raidScaleProp = raid?.raidScaling || raidScaleProgressions.normal;
	let raidScaling;
	if (typeof raidScaleProp === 'string') {
		raidScaling = raidScaleProgressions[raidScaleProp] || raidScaleProgressions.normal;
	}
	else {
		raidScaling = raidScaleProp;
	}
	const raidMonsterArray = Object.values(raid.monsters);
	const roomScaleMult = raidScaling[Math.min(roomNum, raidScaling.length - 1)];
	let roomScale = (isMiniBoss || isBoss) ? 3 : Math.round(roomScaleMult * raidScale * 2) / 2;

	const monsters = {};

	if (isMiniBoss) {
		const miniBossMonsters = raidMonsterArray.filter(monster => monster?.type === 'miniboss');
		const selectedMiniBoss = unweightedSelect(miniBossMonsters);
		monsters[selectedMiniBoss.id] = 1;
	}
	else if (isBoss) {
		const bossMonsters = raidMonsterArray.filter(monster => monster?.type === 'boss');
		const selectedBoss = unweightedSelect(bossMonsters);
		monsters[selectedBoss.id] = 1;
	}

	while (roomScale > 0) {
		// Get list of monsters that are within scale balance.
		const validMonsters = raidMonsterArray.filter(monster => monster?.scale <= roomScale && monster?.type === 'minion');
		if (validMonsters?.length <= 0) {
			break;
		}
		// Select a random valid monster
		const selectedMonster = unweightedSelect(validMonsters);
		// Get max count for that monster (scaleBudget / monsterScale)
		const maxMonsterCount = Math.floor(roomScale / selectedMonster.scale);
		// Determine a random number from 1 to that max
		const monsterCount = roll(maxMonsterCount);
		// Add that many to the monster list and reduce the budget
		if (monsters[selectedMonster.id]) {
			monsters[selectedMonster.id] += monsterCount;
		}
		else {
			monsters[selectedMonster.id] = monsterCount;
		}
		roomScale -= monsterCount * selectedMonster.scale;

		// Repeat until budget = 0 (or no valid monsters exist to fill the scale deficit)
	}

	return monsters;
}

function getRaidExperience(raid, roomNum, finished = false) {
	const finishedXP = 1 * finished;
	// Rooms must increase roomNum AT COMPLETION, specifically BEFORE QUIT-OUT/ENDING CHECKS.
	const miniBossXP = raid?.miniBosses.map(miniBoss => (1 * miniBoss < roomNum)).reduce((xp, total) => total + xp, 0);
	const bossXP = raid?.bosses.map(boss => (1 * boss < roomNum)).reduce((xp, total) => total + xp, 0);
	const roomsXP = ((roomNum - 1) * 0.5);
	return roomsXP + miniBossXP + bossXP + finishedXP;
}

async function getRaidID(channelId) {
	const raidId = await db.query('SELECT raidId FROM raids WHERE channelId = ? AND startTime < ? ORDER BY startTime DESC LIMIT 1', {
		replacements: [channelId, Date.now()],
		type: QueryTypes.SELECT,
	});
	return raidId[0]?.raidId || false;
}

module.exports = { getRaid, getRaidMonster, getValidRaids, getValidRaidMonsters, getRaidExperience, getMonstersForRaid, goToRoom, generateFloor, getMonsterString, getRaidID };