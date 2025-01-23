const weighted = require('weighted');

// x Index is scale - 1 (Eg: accuracyTables[0] is for Scale 1 characters), y index is total mod from lowest to highest point

// Base index = floor(len/2)
const accuracyTables = [
	[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
	[-5, -4, -3, -3, -2, -1, 0, 0, 0, 1, 2, 3, 3, 4, 5],
	[-5, -4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
];

// Base index = 5
const cursedAccuracyTables = [
	[-5, -4, -3, -2, -1, 0, 1, 2, 4, 6],
	[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 6],
	[-5, -4, -3, -2, -1, 0, 1, 2, 2, 3, 4, 6],
];

/**
 * Returns the result of a roll of a single virtual die
 * @param {number} die - Die size to be rolled
 * @returns {number} - Random number between 1 & the die size (inclusive).
 */
function roll(die = 20) {
	return die === 0 ? 0 : Math.floor(Math.random() * die + 1);
}

/**
 * Rolls a given die multiple times, then returns the array of the results.
 * @param {number} amt - Number of times to roll
 * @param die - Die size to be rolled
 * @returns {number[]} - Array of roll results
 */
function multiRoll(amt = 1, die = 20) {
	return [...Array(amt)].map(() => roll(die));
}

/**
 * Takes an array of 2-long arrays (amt, die), then returns the results for each of those arrays
 * Eg: [[2, 20], [1, 6], [3, 4]] -> [[14, 2], [6], [4, 1, 2]]
 * @param rolls - 2d Array of Roll Codes to perform
 * @returns {*}
 */
function arrayRoll(rolls) {
	return rolls.map(subRoll => multiRoll(subRoll[0], subRoll[1]));
}

function parseRoll(inputString = '1+0+0') {
	// Indexes
	// Group 1: MainRoll firstDieCount (default 1, min 1)
	// Group 2: MainRoll explicitDie (default d20, min 1)
	// Group 3: CurseDieMod (default 0, min -5)
	// Group 4: CurseDieSize (optional, default null)
	// Group 5: Accuracy (default 0)
	// Group 6: MAP (default 0)
	// Group 7: Multiplier (default 1)
	// Group 8: Note (default '')
	let matches = inputString.match(/^(\d+)?(d\d+)?(?:\+?(-?\d+)?(d\d+)?)?(?:\+?(-?\d+)?)?(?:m(\d+))?(?:x(\d+))?( +.+)?/i);
	matches = matches.map(match => match && match.replaceAll(/[cd]+/gm, ''));
	const mainRoll = [(matches[1] ? (Math.max(matches[1], 1)) : 1), (matches[2] ? (Math.max(matches[2], 1)) : 20)];
	const curseRoll = matches[4] ? [parseInt(matches[3]), Math.max(parseInt(matches[4]), 1)] : [1, (parseInt(matches[3]) || 0)];
	const mod = matches[5] ? parseInt(matches[5]) : 0;
	const map = matches[6] ? parseInt(matches[6]) : 0;
	const multi = matches[7] ? parseInt(matches[7]) : 1;
	const note = matches[8] || '';
	return [mainRoll, curseRoll, mod, map, multi, note];
}

function explicitParse(inputString = '1d20+1d6+0') {
	// Get Note & Clean Up Rollstring
	const noteSplit = inputString.indexOf(' ');
	const splitCode = (noteSplit !== -1) ? [inputString.slice(0, noteSplit), inputString.slice(noteSplit)] : [inputString, ''];
	let rollCode = splitCode[0];
	const note = splitCode[1].trim();

	// Get Multiplier
	const multi = rollCode.match(/x\d+/gm) ?
		rollCode.match(/x\d+/gm).map(match => parseInt(match.replaceAll('x', ''))).flat().reduce((a, b) => a + b)
		: 1;

	// Get Dice
	const rolls = [];

	rolls.push(...[...rollCode.matchAll(/(\d+)d(\d+)/gm)].map(match => match.slice(1)));
	rollCode = rollCode.replaceAll(/\+*\d+d\d+/gm, '');

	// Get Mods
	const mod = parseInt(rollCode.match(/[-+](\d+)/gm)?.map(match => match.replaceAll('+', '')).reduce((a, b) => parseInt(a) + parseInt(b)) || 0);

	return [rolls, mod, note, multi];
}

function rollString(rolls = [[1, 20], [1, 6]], mod = 0, note = '', multi = 1) {
	const outputArray = [];
	for (let rollNum = 0; rollNum < multi; rollNum++) {
		const results = arrayRoll(rolls);
		const rollText = results
			.map((subArray, index) => rollResultsToString(subArray, index, rolls[index])).join('');
		const resultsSum = results.map((a, index) => {
			if (a.length === 0) {
				return 0;
			}
			else {
				const rollSign = Math.sign(rolls[index][0]);
				return rollSign * Math.max(...a);
			}
		}).reduce((sum, a) => sum + a, 0) + mod;
		const outputText = rollText + ((mod !== 0 || rollText === '') ? `${mod < 0 ? mod : '+' + mod}` : '') + `= **${Math.max(...results[0]) === rolls[0][1] ? '__' + resultsSum + '__' : resultsSum}**`;
		outputArray.push(outputText.replaceAll(/^[+-]+|[+-]+$/g, ''));
	}
	return (note && note + ': ') + outputArray.join(', ');
}

function toWeightedArray(string) {
	const matches = [...string.matchAll(/(\d+)* *([a-zA-Z]+)/gm)]
		.map(m => {m[1] = (m[1] || 1); return m;});
	const total = matches.reduce((a, b) => parseInt(a[1]) + parseInt(b[1]));
	const result = {};

	for (let i = 0; i < matches.length; i++) {
		result[matches[i][2]] = Number(((matches[i][1]) / total).toFixed(3));
	}
	return result;
}

function selectFromWeightedString(string) {
	const spec = toWeightedArray(string);
	const res = weightedSelect(spec);
	console.log(spec, res);
	return res;
}

function weightedSelect(spec) {
	return weighted.select(spec);
}

function unweightedSelect(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function drawDeck(deck, drawCount = 1, severity) {
	const statusCards = [];
	while (statusCards.length < drawCount) {
		const usableCards = deck.filter(card => (!severity || card.severity === severity) && !card.used);
		if (usableCards && usableCards.length > 0) {
			const drawnCard = usableCards[Math.floor(Math.random() * usableCards.length)];
			statusCards.push(drawnCard);
			deck[deck.indexOf(drawnCard)] = { ...drawnCard, used: true };
		}
		else {
			for (const card of deck) {
				if (!severity || card.severity === severity) {
					card.used = false;
				}
			}
		}
	}
	return statusCards;
}

function rollResultsToString(subArray, index, rollParams) {
	if (rollParams?.includes(0)) {
		return '';
	}
	const max = Math.max(...subArray);
	return (index === 0 ? '' : (rollParams[0] < 0 ? '-' : '+')) + '(' +
		subArray.map((item) =>
			((item === rollParams[1]) ? `**${item}**` : ((item === max) ? `${item}` : `~~${item}~~`)))
			.join('+')
		+ ')';
}

function rollFromString(inputText, scale = 0, modifiers = [], category = '') {
	// eslint-disable-next-line prefer-const
	let [mainRoll, curseRoll, mod, map, multi, note] = parseRoll(inputText);
	if (modifiers && category) {
		const categoryModifiers = modifiers.filter(modifier => modifier.category === category);
		for (const modifier of categoryModifiers) {
			if (modifier.type === 'flat') { mod += modifier.amount;}
			else if (modifier.type === 'curse') { curseRoll[1] += modifier.amount;}
		}
	}
	if (scale && scale >= 1 && scale <= 3) {
		// Adjust roll bonus for Accuracy && MAP
		mod = mod || 0;

		const scaleAccuracy = accuracyTables[scale - 1];
		const accuracyMidpoint = Math.ceil(scaleAccuracy.length / 2);
		mod = scaleAccuracy[Math.max(0, Math.min(parseInt(mod) + accuracyMidpoint - 1, scaleAccuracy.length - 1))] + (-5 * map);

		// Adjust roll bonus for Cursed Accuracy
		const cursedScaleAccuracy = cursedAccuracyTables[scale - 1];
		const cursedAccuracyMidpoint = 5;
		curseRoll[1] = 6 + cursedScaleAccuracy[Math.max(0, Math.min(parseInt(curseRoll[1]) + cursedAccuracyMidpoint, cursedScaleAccuracy.length - 1))];
	}
	const rolls = [mainRoll, curseRoll];
	const rolledDice = rolls.reduce((a, b) => parseInt(a) + parseInt(b[0])) * multi;
	return rolledDice > 100 ? `Please keep rolls to under 100 dice. (Attempted to roll ${rolledDice} dice)` : rollString(rolls, mod, note, multi);
}

module.exports = { roll, arrayRoll, rollString, weightedSelect, selectFromWeightedString, unweightedSelect, drawDeck, rollFromString, explicitParse, rollResultsToString };