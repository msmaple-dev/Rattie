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

function parseRoll(inputString = '1+6+0') {
	// Get Note & Clean Up Rollstring
	const noteSplit = inputString.indexOf(' ');
	const splitCode = (noteSplit !== -1) ? [inputString.slice(0, noteSplit), inputString.slice(noteSplit)] : [inputString, ''];
	let rollCode = splitCode[0];
	const note = splitCode[1].trim();

	// Clean up the roll code
	// Get Multiplier
	const multi = Math.min(100, Math.max(0, rollCode.match(/x\d+/gm) ? parseInt(rollCode.match(/x\d+/gm)[0].replace('x', '')) : 1));
	rollCode = rollCode.replace(/x\d+/gm, '');

	// Get Explicit Modifiers
	let mod = rollCode.match(/[+-][+-]+\d+/g) ?
		rollCode.match(/[+-][+-]+\d+/g).map(match => parseInt(match.replaceAll(/(?<=[+-])[+-]/g, ''))).flat().reduce((a, b) => a + b)
		: 0;
	rollCode = rollCode
		.replaceAll(/[+-][+-]+\d+/g, '')
		.replace(/[+-][+-]+\d+/g, result => 'm' + result.slice(0, 1) + result.replace(/[+-]/g, ''))
		.replace(/^\d+(?!\d?d\d+)/, result => result + 'd20');

	// Get primary and secondary rolls
	const rolls = [];
	rolls.push(rollCode.match(/^\d+d\d+/m) && rollCode.match(/^\d+d\d+/m)[0].split('d').map(value => parseInt(value))
		|| rollCode.match(/^\d+(?!\d*d\d)/m) && [parseInt(rollCode.match(/^\d+(?!\d*d\d)/m)[0]), 20]
		|| [1, 20]);
	rollCode = rollCode.replaceAll(/^\d+d\d+/gm, '').replaceAll(/^\d+(?!\d*d\d)/gm, '');
	rolls.push(rollCode.match(/[+-]\d+d\d+/) && rollCode.match(/[+-]\d+d\d+/)[0].split('d').map(value => parseInt(value))
		|| [1, rollCode.match(/[+-]\d+(?!d)/) ? parseInt(rollCode.match(/[+-]\d+(?!d)/)) : 6]);
	rollCode = rollCode.match(/[+-]\d+d\d+/gm) ? rollCode.replaceAll(/[+-]\d+d\d+/gm, '') : rollCode.replace(/[+-]\d+(?!d)/, '');
	mod += rollCode.match(/[+-]\d+(?!d)/g) && rollCode.match(/[+-]\d+(?!d)/g).map(result => parseInt(result)).reduce((a, b) => a + b);

	return [rolls, mod, note, multi];
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
	const splitString = string.split(' ');
	const numArray = splitString.filter(a => !isNaN(a)).map(a => Number(a));
	const deckArray = splitString.filter(a => isNaN(a));
	const lastIteratableIndex = Math.min(numArray.length, deckArray.length);
	const total = numArray.slice(0, lastIteratableIndex).reduce((a, b) => a + b);
	const result = {};

	for (let i = 0; i < lastIteratableIndex; i++) {
		result[deckArray[i]] = Number(((numArray[i]) / total).toFixed(2));
	}
	return result;
}

function selectFromWeightedString(string) {
	const spec = toWeightedArray(string);
	return weightedSelect(spec);
}

function weightedSelect(spec) {
	let i, sum = 0;
	const r = Math.random();
	for (i in spec) {
		sum += spec[i];
		if (r <= sum) return i;
	}
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

function rollFromString(inputText) {
	const parsedValues = parseRoll(inputText);
	const rolledDice = parsedValues[0].reduce((a, b) => parseInt(a) + parseInt(b[0])) * parsedValues[3];
	return rolledDice > 100 ? `Please keep rolls to under 100 dice. (Attempted to roll ${rolledDice} dice)` : rollString(parsedValues[0], parsedValues[1], parsedValues[2], parsedValues[3]);
}

module.exports = { roll, multiRoll, arrayRoll, parseRoll, rollString, weightedSelect, selectFromWeightedString, unweightedSelect, drawDeck, rollFromString, explicitParse, rollResultsToString };