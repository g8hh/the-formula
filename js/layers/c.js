addLayer("c", {
    name: "C",
    symbol() { return player[this.layer].unlocked?("c = "+format(player[this.layer].value)):"C" },
    position: 2,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        value: new Decimal(0),
        loops: new Decimal(0),
        totalLoops: new Decimal(0),
        nullPoints: new Decimal(0),
    }},
    nodeStyle: { "min-width": "60px", height: "60px", "font-size": "30px", "padding-left": "15px", "padding-right": "15px" },
    color: "#0f9900",
    resource: "C-Power", 
    baseResource: "n", 
    baseAmount() {return player.value}, 
    type: "custom",
    requires() { return new Decimal(1.5e40) },
    reqDiv() { 
        let div = new Decimal(1);
        return div;
    },
    base() {
        let base = new Decimal(1.5e10);
        return base;
    },
    exponent: new Decimal(2),
    costScalingStart() {
        let start = new Decimal(15)
        if (hasAchievement("goals", 82)) start = start.plus(player.goals.achievements.filter(x => x>80&&x<90).length)
        return start;
    },
    costScalingInc: new Decimal(.1),
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
        let text = "Reset for <b>"+formatWhole(tmp[this.layer].resetGain)+"</b> C-Power<br><br>";
        if (tmp[this.layer].canBuyMax) text += "Next: n(t) ≥ "+format(tmp[this.layer].nextAtDisp)
        else text += "Req: n(t) ≥ "+format(tmp[this.layer].getNextAt)
        text += "<br>Req Base: "+format(tmp[this.layer].base)
        text += "<br>Req Exponent: "+format(tmp[this.layer].exponent.plus(tmp[this.layer].costScalingInc.times(player[this.layer].points.sub(tmp[this.layer].costScalingStart)).max(0)))
        return text;
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for C-Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return tmp.goals.unlocks>=4 },
    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() { return (player[this.layer].points.gte(tmp[this.layer].costScalingStart))?("After "+formatWhole(tmp[this.layer].costScalingStart)+" C-Power, each C-Power increases its requirement exponent by "+format(tmp[this.layer].costScalingInc)):"" }],
        "blank",
        ["display-text", function() { return "<h3>c("+formatWhole(player[this.layer].points)+") = "+format(player[this.layer].value)+"</h3>" }],
        ["display-text", function() { return "c(C) = "+tmp[this.layer].displayFormula }],
        "blank", "blank",
        ["raw-html", function() { 
            return tmp.c.clockUnl?("<div class='digitalTime'>"+tmp.c.displayedTime+"</div><br><br>"
            +"1 Day = "+(formatWhole(tmp.c.hoursPerDay.floor(), true)+":"+formatWhole(tmp.c.hoursPerDay.sub(tmp.c.hoursPerDay.floor()).times(60).floor(), true))+":00<br>"
            +"Days Passed: "+format(player.c.loops)+', which multiply Time Speed by '+format(tmp.c.clockMult)+"x "+(hasAchievement("goals", 63)?"":"(decays over time)")
            ):"" 
        }],
    ],
    clockUnl() { return tmp.goals.unlocks>=5 },
    hoursPerDay() { 
        let l = player.c.loops
        let day = Decimal.pow(1.1, l).times(hasAchievement("goals", 75)?1:l.plus(1).times(10))
        if (hasAchievement("goals", 56)) day = day.div(2);
        if (hasAchievement("goals", 63)) day = day.div(2);
        if (hasAchievement("goals", 66)) day = day.div(2);
        if (hasAchievement("goals", 75)) day = day.div(player.int.points.max(1));
        return day;
    },
    getDayTarget() {
        let d = player.points.sub(player.c.nullPoints).max(0).times(tmp.timeSpeed).div(3600);
        if (hasAchievement("goals", 75)) d = d.times(player.int.points.max(1));
        if (hasAchievement("goals", 66)) d = d.times(2);
        if (hasAchievement("goals", 63)) d = d.times(2);
        if (hasAchievement("goals", 56)) d = d.times(2);
        d = d.max(1).log(1.1)
        return d.plus(1).floor();
    },
    clockRatio() { 
        let day = tmp.c.hoursPerDay.times(3600);
        return player.points.sub(player.c.nullPoints).max(0).times(hasAchievement("goals", 75)?tmp.timeSpeed:getTimeSpeed()).div(day).max(0);
    },
    displayedTime() {
        let r = tmp.c.clockRatio;
        let h = r.times(tmp.c.hoursPerDay).floor()
        let m = r.times(tmp.c.hoursPerDay.times(60)).sub(h.times(60)).max(0).floor()
        let s = r.times(tmp.c.hoursPerDay.times(3600)).sub(h.times(3600)).sub(m.times(60)).max(0).floor()
        return formatWhole(h, true)+":"+formatWhole(m, true)+":"+formatWhole(s, true)
    },
    fullClockUpdate() {
        tmp[this.layer].calcLoops = layers[this.layer].calcLoops()
        player.c.loops = tmp.c.calcLoops;

        tmp[this.layer].hoursPerDay = layers[this.layer].hoursPerDay()
        tmp[this.layer].clockRatio = layers[this.layer].clockRatio()
        tmp[this.layer].displayedTime = layers[this.layer].displayedTime()
    },
    loopDecayRate() { return hasAchievement("goals", 63)?new Decimal(1):Decimal.pow(.975, player.c.loops.plus(1).log2().plus(1)) },
    calcLoops() { return player.c.totalLoops.times(Decimal.pow(tmp.c.loopDecayRate, player.points.sub(player.c.nullPoints).max(0))) },
    clockMult() { 
        let mult = player.c.loops.plus(1) 
        if (hasAchievement("goals", 61)) mult = mult.plus(player.c.totalLoops.div(10))
        if (hasAchievement("goals", 81)) mult = mult.times(Decimal.pow(1.0025, player.c.totalLoops))
        return mult;
    },
    coefficientInMainFormula() {
        let co = 2
        if (hasAchievement("goals", 46)) co *= 3
        return co;
    },
    displayFormula() {
        let f = "C";
        return f;
    },
    calculateValue(C=player[this.layer].points) {
        let val = C;
        return val;
    },
    update(diff) {
        player[this.layer].value = tmp[this.layer].calculateValue
        if (tmp.c.clockUnl) {
            player.c.loops = tmp.c.calcLoops;
            if (tmp.c.clockRatio.gte(1)) {
                player.c.totalLoops = hasAchievement("goals", 75)?player.c.totalLoops.max(tmp.c.getDayTarget):player.c.totalLoops.plus(1);
                if (!hasAchievement("goals", 63)) player.c.nullPoints = player.points;
                layers[this.layer].fullClockUpdate()
            }
        }
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > tmp[this.layer].row) layerDataReset(this.layer, [])
        else if (layers[resettingLayer].row == tmp[this.layer].row) {
            player.c.loops = new Decimal(0)
            player.c.totalLoops = new Decimal(0)
            player.c.nullPoints = new Decimal(0)
        }
    }
})