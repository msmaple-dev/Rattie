/**
 * Returns the result of a roll of a single virtual die
 * @param {number} die - Die size to be rolled
 * @returns {number} - Random number between 1 & the die size (inclusive).
 */
function roll(die = 20) {
	return die === 0 ? 0 : Math.floor(Math.random() * die+1);
}

/**
 * Rolls a given die multiple times, then returns the array of the results.
 * @param {number} amt - Number of times to roll
 * @param die - Die size to be rolled
 * @returns {number[]} - Array of roll results
 */
function multiRoll(amt = 1, die = 20) {
	return [...Array(amt)].map((_, i) => roll(die))
}

/**
 * Takes an array of 2-long arrays (amt, die), then returns the results for each of those arrays
 * Eg: [[2, 20], [1, 6], [3, 4]] -> [[14, 2], [6, 5], [4, 1, 2]]
 * @param rolls - 2d Array of Roll Codes to perform
 * @returns {*}
 */
function arrayRoll(rolls){
	return rolls.map(roll => multiRoll(roll[0], roll[1]))
}

function parseRoll(rollString = "1+6+0"){
	const noteSplit = rollString.indexOf(" ");
	let splitCode = (noteSplit !== -1) ? [rollString.slice(0, noteSplit), rollString.slice(noteSplit)] : [rollString, ""];
	let rollCode = splitCode[0]
	let note = splitCode[1].trim()

	// Clean up the roll code
	// Get Multiplier
	let multi = Math.min(100, Math.max(0, rollCode.match(/x\d+/gm) ? parseInt(rollCode.match(/x\d+/gm)[0].replace("x", "")) : 1))
	rollCode = rollCode.replace(/x\d+/gm, "")

	// Get Explicit Modifiers
	let mod = rollCode.match(/[\+\-][\+\-]+\d+/g) ?
		rollCode.match(/[\+\-][\+\-]+\d+/g).map(match => parseInt(match.replaceAll(/(?<=[\+-])[\+-]/g, ""))).flat().reduce((a,b)=>a+b)
		: 0
	rollCode = rollCode
		.replaceAll(/[\+\-][\+\-]+\d+/g, "")
		.replace(/[\+\-][\+\-]+\d+/g, result => "m"+result.slice(0, 1)+result.replace(/[\+\-]/g, ""))
		.replace(/^\d+(?!\d?d\d+)/, result => result+"d20")

	// Get primary and secondary rolls
	let rolls = []
	rolls.push(rollCode.match(/^\d+d\d+/m) && rollCode.match(/^\d+d\d+/m)[0].split("d").map(value => parseInt(value))
		|| rollCode.match(/^\d+(?!\d*d\d)/m) && [parseInt(rollCode.match(/^\d+(?!\d*d\d)/m)[0]), 20]
		|| [1, 20])
	rollCode = rollCode.replaceAll(/^\d+d\d+/gm, "").replaceAll(/^\d+(?!\d*d\d)/gm, "")
	rolls.push(rollCode.match(/[\+-]\d+d\d+/) && rollCode.match(/[\+-]\d+d\d+/)[0].split("d").map(value => parseInt(value))
		|| [1, rollCode.match(/[\+-]\d+(?!d)/) ? parseInt(rollCode.match(/[\+-]\d+(?!d)/)) : 6])
	rollCode = rollCode.match(/[\+-]\d+d\d+/gm) ? rollCode.replaceAll(/[\+-]\d+d\d+/gm, "") : rollCode.replace(/[\+-]\d+(?!d)/, "")
	mod += rollCode.match(/[\+-]\d+(?!d)/g) && rollCode.match(/[\+-]\d+(?!d)/g).map(result => parseInt(result)).reduce((a, b) => a+b)

	return [rolls, mod, note, multi]
}

function rollString(rolls = [[1, 20], [1, 6]], mod = 0, note = "", multi = 1){
	let outputArray = []
	for (let rollNum = 0; rollNum < multi; rollNum++){
		let results = arrayRoll(rolls)
		let rollText = results
			.map((subArray, index)=>{
				const rollParams = rolls[index]
				if(rollParams.includes(0)){return ""}
				const max = Math.max(...subArray);
				return (index === 0 ? "" : (rollParams[0] < 0 ? "-" : "+")) + "(" +
					subArray.map((item) =>
						((item === rollParams[1]) ? `**${item}**` : ((item === max) ? `${item}` : `~~${item}~~`)))
						.join("+")
					+")"
			}).join("")
		let resultsSum = results.map((a, index) => {
			if(a.length === 0){return 0}
			else{
				const rollSign = Math.sign(rolls[index][0])
				return rollSign * Math.max(...a)
			}
		}).reduce((sum, a) => sum+a, 0) + mod
		let outputText = rollText + ((mod !== 0 || rollText === "") ? `${mod < 0 ? mod : "+" + mod}` : "") + `= **${Math.max(...results[0]) === rolls[0][1] ? "__"+resultsSum+"__" : resultsSum}**`
		outputArray.push(outputText.replaceAll(/^[\+-]+|[\+-]+$/g, ""))
	}
	return (note && note+": ")+outputArray.join(", ")
}

module.exports = {roll, multiRoll, arrayRoll, parseRoll, rollString}