let modInfo = {
	name: "公式树 - The Formula",
	id: "formula_tree_game",
	author: "Jacorb90 汉化by QwQe308",
	pointsName: "时间",
	modFiles: ["layers/a.js", "layers/b.js", "layers/c.js", "layers/goals.js", "layers/integration.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

function displayFormula() {
	let f = "t"
	let expData = [player.b.unlocked, player.c.unlocked, hasAchievement("goals", 62)]
	if (expData.some(x => x)) {
		f += "<sup>";
		if (expData[0]) {
			let extraExp = "1"
			if (expData[2]) extraExp = "log(a + 1) + 1"
			f += "(b + "
			if (expData[1]) f += formatWhole(tmp.c.coefficientInMainFormula)+" × c + "+extraExp+")"
			else f += extraExp+")"
		} else if (expData[1]) f += "(2 × c + "+(expData[2]?"log(a + 1) + 1":"1")+")"
		else f = "(log(a + 1) + 1)"
		f += "</sup>";
	}

	f += " × a";
	if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) f += " × B<sub>201</sub>";
	if (hasAchievement("goals", 15)) f += " × 成就";
	return f;
}

function displayIntFormula() {
	let f = "t"
	let exp = ""
	let expData = [player.b.unlocked, player.c.unlocked, hasAchievement("goals", 62)]
	if (expData.some(x => x)) {
		if (expData[0]) {
			let extraExp = "IP + 2"
			if (expData[2]) extraExp = "log(a + 1) + IP + 2"
			exp += "(b + "
			if (expData[1]) exp += formatWhole(tmp.c.coefficientInMainFormula)+" × c + "+extraExp+")"
			else exp += extraExp+")"
		} else if (expData[1]) exp += "(2 × c + "+(expData[2]?"log(a + 1) + 2":"2")+")"
		else exp = "(log(a + 1) + 2)"
	}
	f += "<sup>"+exp+"</sup>"

	f += " × a";
	if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) f += " × B<sub>201</sub>";
	if (hasAchievement("goals", 15)) f += " × 成就";
	f += " ÷ (IP - 1)!"
	return f;
}

function calculateValue(t) {
	if (player.int.unlocked && player.int.value.gt(0)) {
		let val = t.pow(player.int.value).div(player.int.value.sub(1).factorial())

		let extraExp = hasAchievement("goals", 62)?player.a.value.plus(1).log10().plus(2):new Decimal(2)
		let exp = (player.b.unlocked?player.b.value.plus(extraExp):extraExp).plus(player.c.unlocked?player.c.value.times(tmp.c.coefficientInMainFormula):0)
		if (hasAchievement("goals", 62)||player.b.unlocked||player.c.unlocked) t = t.pow((player.b.unlocked||player.c.unlocked)?exp:extraExp).div((player.b.unlocked||player.c.unlocked)?exp:extraExp)

		val = val.times(player.a.value).times(t);
		if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) val = val.times(gridEffect("b", 201));
		if (hasAchievement("goals", 15)) val = val.times(tmp.goals.achsCompleted);
		return val;
	} else {
		let extraExp = hasAchievement("goals", 62)?player.a.value.plus(1).log10().plus(1):new Decimal(1)
		let exp = (player.b.unlocked?player.b.value.plus(extraExp):extraExp).plus(player.c.unlocked?player.c.value.times(tmp.c.coefficientInMainFormula):0)
		if (hasAchievement("goals", 62)||player.b.unlocked||player.c.unlocked) t = t.pow((player.b.unlocked||player.c.unlocked)?exp:extraExp)

		let val = player.a.value.times(t);
		if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) val = val.times(gridEffect("b", 201));
		if (hasAchievement("goals", 15)) val = val.times(tmp.goals.achsCompleted);
		return val;
	}
}

function updateValue() {
	player.value = calculateValue(player.points.times(tmp.timeSpeed));
}

// Set your version in num and name
let VERSION = {
	num: "0.1.2",
	name: "集合",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1.2 - 集合</h3><br>
		- 开发了“集合”<br>
		- 平衡到47成就<br>
	<br><br>
	<h3>v0.1.1 - 更多字母, 更有趣的游戏</h3><br>
		- 开发了C能量 & 钟<br>
		- 平衡到36成就<br>
	<br><br>
	<h3>v0.1 - 学习字母</h3><br>
		- 创建基础内容.<br>
		- 开发了A能量 & 进化<br>
		- 开发了成就<br>
		- 开发了B能量和电池<br>
		- 平衡到19成就<br>`

let winText = `恭喜! 你完成了这个游戏, 但是现在...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "fullClockUpdate", "buyMax"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getTimeSpeed() {
	let spd = new Decimal(1);
	if (hasAchievement("goals", 36)) spd = spd.times(tmp.goals.goal36eff);
	if (hasAchievement("goals", 53) && tmp.b.batteriesUnl) spd = spd.times(gridEffect("b", 302))
	if (tmp.c.clockUnl) spd = spd.times(tmp.c.clockMult);
	if (hasAchievement("goals", 66)) spd = spd.times(tmp.goals.achsCompleted)
	else {
		if (hasAchievement("goals", 62)) spd = spd.times(2);
		if (hasAchievement("goals", 65)) spd = spd.times(2);
	}
	if (hasAchievement("goals", 72)) spd = spd.times(player.int.value.max(1))
	return spd;
}

function getTimeSpeedFormula() {
	let f = ""
	if (hasAchievement("goals", 36)) f = '"绝对是蜜蜂笑话"'
	if (hasAchievement("goals", 53)) f += " × B<sub>302</sub>"
	if (tmp.c.clockUnl) f += (f.length>0?" × ":"")+"天数效果"
	if (hasAchievement("goals", 66)) f += (f.length>0?" × ":"")+"成就"
	else if (hasAchievement("goals", 62)) f += (f.length>0?" × ":"")+(hasAchievement("goals", 65)?"4":"2")
	if (hasAchievement("goals", 72)) f += (f.length>0?" × ":"")+"IP"
	return f;
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
	function() {
		if (tmp.timeSpeed.eq(1)) return;
		else return "时间速率(timespeed) = "+getTimeSpeedFormula();
	}
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