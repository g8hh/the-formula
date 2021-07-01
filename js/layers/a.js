addLayer("a", {
    name: "A",
    symbol() { return player[this.layer].unlocked?("a = "+format(player[this.layer].value)):"A" },
    position: 0,
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        value: new Decimal(0),
        avolve: new Decimal(0),
    }},
    nodeStyle: { "min-width": "60px", height: "60px", "font-size": "30px", "padding-left": "15px", "padding-right": "15px" },
    color: "#eb3434",
    resource: "A-Power", 
    baseResource: "n", 
    baseAmount() {return player.value}, 
    type: "custom",
    requires() { return new Decimal(player[this.layer].points.gte(1)?10:0) },
    reqDiv() {
        let div = new Decimal(1);
        if (hasAchievement("goals", 14)) div = div.times(1.5);
        if (tmp.b.batteriesUnl) div = div.times(gridEffect("b", 101));
        return div;
    },
    base() { 
        let base = new Decimal(1.5);
        if (hasAchievement("goals", 22)) base = base.sub(.1);
        if (hasAchievement("goals", 31)) base = base.sub(.1);
        return base;
    },
    canBuyMax() { return hasAchievement("goals", 21) },
    resetsNothing() { return hasAchievement("goals", 26) },
    autoPrestige() { return false },
    tooltipLocked() { return "" },
    canReset() { return tmp[this.layer].getResetGain.gte(1) },
    getResetGain() { 
        let gain = tmp[this.layer].baseAmount.times(tmp[this.layer].reqDiv).sub(tmp[this.layer].requires).plus(1).max(1).log(tmp[this.layer].base).plus(1).floor().sub(player[this.layer].points).max(0)
        if (!tmp[this.layer].canBuyMax) gain = gain.min(1);
        return gain;
    },
    getNextAt(canBuyMax=false) {
        let amt = player[this.layer].points.plus((canBuyMax&&tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt))?tmp[this.layer].getResetGain:0)
        return Decimal.pow(tmp[this.layer].base, amt).sub(1).plus(tmp[this.layer].requires).div(tmp[this.layer].reqDiv)
    },
    prestigeButtonText() {
        let text = (tmp[this.layer].resetsNothing?"Gain ":"Reset for ")+"<b>"+formatWhole(tmp[this.layer].resetGain)+"</b> A-Power<br><br>";
        if (tmp[this.layer].canBuyMax) text += "Next: n(t) ≥ "+format(tmp[this.layer].nextAtDisp)
        else text += "Req: n(t) ≥ "+format(tmp[this.layer].getNextAt)
        text += "<br>Req Base: "+format(tmp[this.layer].base)
        return text;
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for A-Power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    addedValue() {
        let added = new Decimal(0);
        if (hasAchievement("goals", 13) && !hasAchievement("goals", 33)) added = added.plus(.5);
        return added;
    },
    displayFormula() {
        let f = "A";
        if (hasAchievement("goals", 25)) f = "(A + "+(tmp.b.batteriesUnl?("(B × B<sub>102</sub>)"):"B")+")"
        if (tmp[this.layer].bars.Avolve.unlocked) {
            f += " × (Avolve + 1)"
            if (hasAchievement("goals", 32)) f += "<sup>2</sup>"
        }
        if (hasAchievement("goals", 23)) f += " × (b ÷ 4 + 1)"
        if (hasAchievement("goals", 33)) f += " × Goals"
        if (tmp[this.layer].addedValue.gt(0)) f += " + "+format(tmp[this.layer].addedValue)
        return f;
    },
    calculateValue(A=player[this.layer].points) {
        let val = A;
        if (hasAchievement("goals", 25)) {
            let b = player.b.points;
            if (tmp.b.batteriesUnl) b = b.times(gridEffect("b", 102));
            val = val.plus(b);
        }
        if (tmp[this.layer].bars.Avolve.unlocked) val = val.times(player[this.layer].avolve.plus(1).pow(hasAchievement("goals", 32)?2:1));
        if (hasAchievement("goals", 23)) val = val.times(player.b.value.div(4).plus(1));
        if (hasAchievement("goals", 33)) val = val.times(tmp.goals.achsCompleted);
        if (tmp[this.layer].addedValue.gt(0)) val = val.plus(tmp[this.layer].addedValue);
        return val;
    },
    update(diff) {
        player[this.layer].value = tmp[this.layer].calculateValue
        if (tmp[this.layer].bars.Avolve.unlocked && tmp[this.layer].bars.Avolve.progress>=1) player[this.layer].avolve = player[this.layer].avolve.plus(1);
    },
    bars: {
        Avolve: {
            direction: RIGHT,
            width: 200,
            height: 40,
            reqDiv() { 
                let div = buyableEffect(this.layer, 11);
                return div;
            },
            req() { return Decimal.pow(5, player[this.layer].avolve.plus(1)).times(10).div(tmp[this.layer].bars.Avolve.reqDiv) },
            progress() { return player.value.div(tmp[this.layer].bars.Avolve.req) },
            unlocked() { return tmp.goals.unlocks>=1 },
            display() { return "Req: n(t) ≥ "+formatWhole(tmp[this.layer].bars.Avolve.req)+" ("+format(100-tmp[this.layer].bars.Avolve.progress)+"%)" },
            fillStyle: {"background-color": "#ba2323"},
        },
    },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title() { return "Avolve Requirement<br>÷"+format(tmp[this.layer].buyables[this.id].effect) },
            effExp() {
                let exp = new Decimal(1);
                if (hasAchievement("goals", 16)) exp = exp.plus(1);
                if (hasAchievement("goals", 24)) exp = exp.plus(1);
                return exp;
            },
            effect() { 
                let eff = player[this.layer].buyables[this.id].plus(1).pow(tmp[this.layer].buyables[this.id].effExp);
                if (hasAchievement("goals", 34) && tmp.b.batteriesUnl) eff = eff.times(gridEffect("b", 103));
                return eff;
            },
            cost(x=player[this.layer].buyables[this.id]) { return Decimal.pow(1.5, x).times(5).plus(10).ceil() },
            display() { return "Cost: "+formatWhole(tmp[this.layer].buyables[this.id].cost)+" A-Power" },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()) },
            buy() { 
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost).max(0)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1);
            },
            unlocked() { return tmp[this.layer].bars.Avolve.unlocked },
        },  
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() { return "<h3>a("+formatWhole(player[this.layer].points)+") = "+format(player[this.layer].value)+"</h3>" }],
        ["display-text", function() { return "a(A) = "+tmp[this.layer].displayFormula }],
        "blank", "blank",
        ["display-text", function() { return tmp[this.layer].bars.Avolve.unlocked?("<h4>Avolve Level: "+formatWhole(player[this.layer].avolve)+"</h4>"):"" }],
        ["bar", "Avolve"], "blank",
        ["buyable", 11],
    ],
    componentStyles: {
        buyable: {
            width: "140px",
            height: "100px",
            "border-radius": "5%",
            "z-index": "1",
        },
        bar: {
            "z-index": "0",
        },
    },
})
