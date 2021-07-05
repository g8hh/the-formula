addLayer("b", {
    name: "B",
    symbol() { return player[this.layer].unlocked?("b = "+format(player[this.layer].value)):"B" },
    position: 1,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        value: new Decimal(0),
    }},
    nodeStyle: { "min-width": "60px", height: "60px", "font-size": "30px", "padding-left": "15px", "padding-right": "15px" },
    color: "#3734ed",
    resource: "B-Power", 
    baseResource: "n", 
    baseAmount() {return player.value}, 
    type: "custom",
    requires() { return new Decimal(5e4) },
    reqDiv() { 
        let div = new Decimal(1);
        if (tmp[this.layer].batteriesUnl) div = div.times(gridEffect(this.layer, 101));
        return div;
    },
    base() {
        let base = new Decimal(200);
        if (hasAchievement("goals", 35)) base = base.div(2);
        return base;
    },
    exponent() {
        let exp = 1.25
        return new Decimal(exp);
    },
    costScalingStart: new Decimal(15),
    costScalingInc: new Decimal(.05),
    canBuyMax() { return false },
    autoPrestige() { return false },
    resetsNothing() { return false },
    tooltipLocked() { return "Req: n(t) ≥ "+formatWhole(tmp[this.layer].requires) },
    canReset() { return tmp[this.layer].getResetGain.gte(1) },
    getResetGain() { 
        let gain = tmp[this.layer].baseAmount.times(tmp[this.layer].reqDiv).div(tmp[this.layer].requires).max(1).log(tmp[this.layer].base).root(tmp[this.layer].exponent)
        if (gain.gte(tmp[this.layer].costScalingStart)) gain = gain.pow(tmp[this.layer].exponent).log(tmp[this.layer].costScalingStart).sub(tmp[this.layer].exponent).div(tmp[this.layer].costScalingInc).plus(tmp[this.layer].costScalingStart).plus(1).floor().sub(player[this.layer].points).max(0)
        else gain = gain.plus(1).floor().sub(player[this.layer].points).max(0)
        if (!tmp[this.layer].canBuyMax) gain = gain.min(1);
        if (tmp[this.layer].baseAmount.times(tmp[this.layer].reqDiv).lt(tmp[this.layer].requires)) return new Decimal(0);
        return gain;
    },
    getNextAt(canBuyMax=false) {
        let amt = player[this.layer].points.plus((canBuyMax&&tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt))?tmp[this.layer].getResetGain:0)
        if (amt.gte(tmp[this.layer].costScalingStart)) return Decimal.pow(tmp[this.layer].base, tmp[this.layer].costScalingStart.pow(tmp[this.layer].exponent.plus(amt.sub(tmp[this.layer].costScalingStart).times(tmp[this.layer].costScalingInc)))).times(tmp[this.layer].requires).div(tmp[this.layer].reqDiv)
        else return Decimal.pow(tmp[this.layer].base, amt.pow(tmp[this.layer].exponent)).times(tmp[this.layer].requires).div(tmp[this.layer].reqDiv)
    },
    prestigeButtonText() {
        let text = "Reset for <b>"+formatWhole(tmp[this.layer].resetGain)+"</b> B-Power<br><br>";
        if (tmp[this.layer].canBuyMax) text += "Next: n(t) ≥ "+format(tmp[this.layer].nextAtDisp)
        else text += "Req: n(t) ≥ "+format(tmp[this.layer].getNextAt)
        text += "<br>Req Base: "+format(tmp[this.layer].base)
        text += "<br>Req Exponent: "+format(tmp[this.layer].exponent.plus(tmp[this.layer].costScalingInc.times(player[this.layer].points.sub(tmp[this.layer].costScalingStart)).max(0)))
        return text;
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for B-Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return tmp.goals.unlocks>=2 },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return (player[this.layer].points.gte(tmp[this.layer].costScalingStart))?("After "+formatWhole(tmp[this.layer].costScalingStart)+" B-Power, each B-Power increases its requirement exponent by "+format(tmp[this.layer].costScalingInc)):"" }],
        "blank",
        ["display-text", function() { return "<h3>b("+formatWhole(player[this.layer].points)+") = "+format(player[this.layer].value)+"</h3>" }],
        ["display-text", function() { return "b(B) = "+tmp[this.layer].displayFormula }],
        "blank", "blank",
        ["display-text", function() { return tmp[this.layer].batteriesUnl?("Batteries Used: "+formatWhole(tmp[this.layer].usedBatteries)+" / "+formatWhole(tmp[this.layer].batteryLimit)):"" }],
        "grid",
    ],
    displayFormula() {
        let f = "B";
        if (hasAchievement("goals", 64)) f += " + c"
        return f;
    },
    calculateValue(B=player[this.layer].points) {
        let val = B;
        if (hasAchievement("goals", 64)) val = val.plus(player.c.value);
        return val;
    },
    update(diff) {
        player[this.layer].value = tmp[this.layer].calculateValue
    },
    batteriesUnl() { return tmp.goals.unlocks>=3 },
    batteryEffectTypes: {
        101: "Divides the costs of A-Power & B-Power",
        102: "Multiplies B-Power's boost to effective A-Power",
        103: "Divides the Avolve requirement",
        201: "Multiplies n(t) & B<sub>101</sub>'s effect",
        202: "Multiplies a(A) & B<sub>102</sub>'s effect",
        203: "Multiplies B<sub>103</sub>'s effect & Makes the reward of &quot;Definitely a Bee Joke&quot; stronger & faster by ",
        301: "Multiplies A-Power gain & B<sub>201</sub>'s effect",
        302: "Multiplies Time Speed & B<sub>202</sub>'s effect",
        303: "Reduces the Avolve requirement base & multiplies B<sub>203</sub>'s effect",
    },
    batteryLimit() { 
        if (!tmp[this.layer].batteriesUnl) return 0;
        
        let limit = hasAchievement("goals", 34)?4:2 
        if (hasAchievement("goals", 43)) limit++;
        if (hasAchievement("goals", 53)) limit++;
        return limit;
    },
    usedBatteries() { return Object.values(player[this.layer].grid).filter(x => x.gt(0)).length },
    batteryRowsWithRewards() {
        let rows = 1
        if (hasAchievement("goals", 45)) rows++;
        if (hasAchievement("goals", 53)) rows++;
        return rows;
    },
    grid: {
        rows() { return tmp[this.layer].batteriesUnl?(hasAchievement("goals", 34)?3:2):0 },
        cols() { return tmp[this.layer].batteriesUnl?(hasAchievement("goals", 34)?3:2):0 },
        maxRows: 3,
        maxCols: 3,

        getStartData(id) {
            return new Decimal(0)
        },
        getUnlocked(id) {
            return tmp[this.layer].batteriesUnl;
        },
        getTitle(data, id) {
            return "B<sub>"+id+"</sub>: "+(data.gt(0)?"ON":"OFF")
        },
        getDisplay(data, id) {
            let ed = (id<((tmp.b.batteryRowsWithRewards+1)*100))?tmp[this.layer].batteryEffectTypes[id]:("Multiplies B<sub>"+(id-100)+"</sub>'s effect")
            let eff = gridEffect(this.layer, id);
            let display = ed+" by "+format(eff);
            return display;
        },
        getEffect(data, id) {
            let row = Math.floor(id/100);
            let col = id-row*100;
            let mult = new Decimal(1);
            if (row<tmp[this.layer].grid.rows) Array.from({length: tmp[this.layer].grid.rows}, (v, i) => i+1).filter(x => row<x).forEach(function(x) { mult = mult.times(gridEffect("b", x*100+col)) })
            if (data===undefined) return new Decimal(mult)
            let x = data.times(player[this.layer].points);
            let rt = row*col/2;
            let eff = x.plus(1).root(rt).times(mult);
            return eff;
        },
        getCanClick(data, id) { return (layers[this.layer].usedBatteries()<tmp[this.layer].batteryLimit)||data.gt(0) },
        onClick(data, id) { 
            player[this.layer].grid[id] = new Decimal(data.eq(0)?1:0);
        },
        getStyle(data, id) { return {
            "background-color": data.gt(0)?tmp.b.color:"#9696ab",
        }},
    },
    componentStyles: {
        gridable: {
            width: "120px",
            "min-width": "120px",
            height: "120px",
            "border-radius": "5%",
        },
    },
})