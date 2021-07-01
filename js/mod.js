let modInfo = {
	name: "The Formula",
	id: "formula_tree_game",
	author: "Jacorb90",
	pointsName: "time",
	modFiles: ["layers/a.js", "layers/b.js", "layers/goals.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

function displayFormula() {
	let f = "t"
	if (player.b.unlocked) f = "t<sup>(b + 1)</sup>"

	f += " × a";
	if (hasAchievement("goals", 15)) f += " × Goals";
	return f;
}

function calculateValue(t) {
	if (player.b.unlocked) t = t.pow(player.b.value.plus(1))

	let val = player.a.value.times(t);
	if (hasAchievement("goals", 15)) val = val.times(tmp.goals.achsCompleted);
	return val;
}

function updateValue() {
	player.value = calculateValue(player.points.times(tmp.timeSpeed));
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Learning Our Letters",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1 - Learning Our Letters</h3><br>
		- Set up basic stuff.<br>
		- Implemented A-Power & Avolve<br>
		- Implemented Goals<br>
		- Implemented B-Power & Batteries<br>
		- Balanced up to 19 Goals completed<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getTimeSpeed() {
	let spd = new Decimal(1);
	if (hasAchievement("goals", 36)) {
		let p = player.points;
		if (p.gte(50)) p = p.div(2).plus(25);
		if (p.gte(65)) p = p.div(2).plus(32.5);
		if (p.gte(75)) p = p.times(5625).cbrt();
		spd = spd.times(Decimal.sub(5, p.max(10).sub(10).div(20)).max(1));
	}
	return spd;
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	return gain
}

function gainPoints(diff) {
	player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	value: new Decimal(0),
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return false
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}