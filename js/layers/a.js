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
    milestonePopups: false,
    nodeStyle: { "min-width": "60px", height: "60px", "font-size": "30px", "padding-left": "15px", "padding-right": "15px" },
    color: "#eb3434",
    resource: "A-Power", 
    baseResource: "n", 
    baseAmount() {return player.value}, 
    type: "custom",
    requires() { return new Decimal(player[this.layer].points.gte(1)?10:0) },
    gainMult() {
        let mult = new Decimal(1);
        if (hasAchievement("goals", 53) && tmp.b.batteriesUnl) mult = mult.times(gridEffect("b", 301));
        return mult;
    },
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
        if (hasAchievement("goals", 41)) base = base.sub(.05);
        if (hasAchievement("goals", 52)) base = base.sub(.05);
        return base;
    },
    canBuyMax() { return hasAchievement("goals", 21) },
    resetsNothing() { return hasAchievement("goals", 26) },
    autoPrestige() { return player.a.auto && hasMilestone("a", 0) },
    tooltipLocked() { return "" },
    canReset() { return tmp[this.layer].getResetGain.gte(1) },
    getResetGain() { 
        let gain = tmp[this.layer].baseAmount.times(tmp[this.layer].reqDiv).sub(tmp[this.layer].requires).plus(1).max(1).log(tmp[this.layer].base).times(tmp[this.layer].gainMult).plus(1).floor().sub(player[this.layer].points).max(0)
        if (!tmp[this.layer].canBuyMax) gain = gain.min(1);
        return gain;
    },
    getNextAt(canBuyMax=false) {
        let amt = player[this.layer].points.plus((canBuyMax&&tmp[this.layer].baseAmount.gte(tmp[this.layer].nextAt))?tmp[this.layer].getResetGain:0)
        return Decimal.pow(tmp[this.layer].base, amt.div(tmp[this.layer].gainMult)).sub(1).plus(tmp[this.layer].requires).div(tmp[this.layer].reqDiv)
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
    displayFormula() {
        let f = hasAchievement("goals", 65)?"1.05<sup>&radic;<span style='text-decoration: overline'>A</span></sup> × A":"A";
        if (hasAchievement("goals", 25)) {
            if (hasAchievement("goals", 44)) f += " × "+(tmp.b.batteriesUnl?("(B × B<sub>102</sub> + 1)"):"(B + 1)")
            else f = "("+f+" + "+(tmp.b.batteriesUnl?("(B × B<sub>102</sub>)"):"B")+")"
        }
        if (tmp[this.layer].bars.Avolve.unlocked) {
            f += " × (Avolve + 1)"
            if (hasAchievement("goals", 32)) f += "<sup>2</sup>"
        }
        if (hasAchievement("goals", 23)) f += " × (b ÷ 4 + 1)"
        if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) f += " × B<sub>202</sub>";
        if (hasAchievement("goals", 33)) f += " × Goals"
        if (hasAchievement("goals", 13) && !hasAchievement("goals", 33)) f += " + 0.5";
        return f;
    }, 
    calculateValue(A=player[this.layer].points) {
        let val = A;
        if (hasAchievement("goals", 65)) val = val.times(Decimal.pow(1.05, A.sqrt()))
        if (hasAchievement("goals", 25)) {
            let b = player.b.points;
            if (tmp.b.batteriesUnl) b = b.times(gridEffect("b", 102));
            if (hasAchievement("goals", 44)) val = val.times(b.plus(1));
            else val = val.plus(b);
        }
        if (tmp[this.layer].bars.Avolve.unlocked) val = val.times(player[this.layer].avolve.plus(1).pow(hasAchievement("goals", 32)?2:1));
        if (hasAchievement("goals", 23)) val = val.times(player.b.value.div(4).plus(1));
        if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) val = val.times(gridEffect("b", 202));
        if (hasAchievement("goals", 33)) val = val.times(tmp.goals.achsCompleted);
        if (hasAchievement("goals", 13) && !hasAchievement("goals", 33)) val = val.plus(.5);
        return val;
    },
    update(diff) {
        player[this.layer].value = tmp[this.layer].calculateValue
        if (tmp[this.layer].bars.Avolve.unlocked) {
            if (tmp[this.layer].bars.Avolve.progress>=1) {
                if (hasAchievement("goals", 82)) player[this.layer].avolve = player[this.layer].avolve.max(tmp[this.layer].bars.Avolve.target)
                else player[this.layer].avolve = player[this.layer].avolve.plus(1);
            }
            if (hasAchievement("goals", 73) && player.a.autoAvolve) layers[this.layer].buyables[11].buyMax()
        }
    },
    bars: {
        Avolve: {
            direction: RIGHT,
            width: 200,
            height: 40,
            scalings: [
                {
                    title: "Scaled",
                    start() {
                        let start = new Decimal(100)
                        if (hasAchievement("goals", 54)) start = start.plus(25);
                        return start;
                    },
                    pow() { 
                        let pow = new Decimal(2)
                        if (hasAchievement("goals", 81)) pow = pow.sqrt();
                        return pow;
                    },
                },
            ],
            scalingName() {
                let name = ""
                for (let i=tmp.a.bars.Avolve.scalings.length-1;i>=0;i--) {
                    if (player[this.layer].avolve.gte(tmp.a.bars.Avolve.scalings[i].start)) {
                        name = tmp.a.bars.Avolve.scalings[i].title
                        break;
                    }
                }
                if (name.length>0) name += " ";
                return name;
            },
            reqDiv() { 
                let div = buyableEffect(this.layer, 11);
                return div;
            },
            req() { 
                let x = player[this.layer].avolve
                for (let i=0;i<tmp.a.bars.Avolve.scalings.length;i++) {
                    let data = tmp.a.bars.Avolve.scalings[i]
                    if (x.gte(data.start)) x = x.pow(data.pow).div(data.start.pow(data.pow.sub(1)))
                }
                return Decimal.pow(5, x.plus(1)).times(10).div(tmp[this.layer].bars.Avolve.reqDiv) 
            },
            target() {
                let x = player.value.times(tmp[this.layer].bars.Avolve.reqDiv).div(10).max(1).log(5).sub(1);
                for (let i=tmp.a.bars.Avolve.scalings.length-1;i>=0;i--) {
                    let data = tmp.a.bars.Avolve.scalings[i]
                    if (x.gte(data.start)) x = x.times(data.start.pow(data.pow.sub(1))).root(data.pow)
                }
                return x.plus(1).floor().max(0);
            },
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
                if (hasAchievement("goals", 51)) exp = exp.plus(tmp.goals.achsCompleted);
                if (hasAchievement("goals", 65)) exp = exp.plus(player[this.layer].buyables[this.id]);
                if (hasAchievement("goals", 73)) exp = exp.plus(player.int.value);
                return exp;
            },
            effect() { 
                let eff = player[this.layer].buyables[this.id].plus(1).pow(tmp[this.layer].buyables[this.id].effExp);
                if (hasAchievement("goals", 34) && tmp.b.batteriesUnl) eff = eff.times(gridEffect("b", 103));
                return eff;
            },
            cost(x=player[this.layer].buyables[this.id]) { return Decimal.pow(1.5, x).times(5).plus(10).ceil() },
            target(r=player[this.layer].points) { return r.sub(10).div(5).max(1).log(1.5).plus(1).floor() },
            display() { return "Level: "+formatWhole(player[this.layer].buyables[this.id])+"<br>Cost: "+formatWhole(tmp[this.layer].buyables[this.id].cost)+" A-Power" },
            canAfford() { return player[this.layer].points.gte(layers[this.layer].buyables[this.id].cost()) },
            buy() { 
                if (hasAchievement("goals", 73)) {
                    layers[this.layer].buyables[this.id].buyMax();
                    return;
                }
                player[this.layer].points = player[this.layer].points.sub(tmp[this.layer].buyables[this.id].cost).max(0)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1);
            },
            buyMax() {
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(tmp[this.layer].buyables[this.id].target)
            },
            unlocked() { return tmp[this.layer].bars.Avolve.unlocked },
        },  
    },
    milestones: {
        0: {
            effectDescription: "Automate A-Power.",
            unlocked() { return hasAchievement("goals", 52) },
            done() { return hasAchievement("goals", 52) },
            toggles: [["a", "auto"]]
        },
        1: {
            effectDescription: "Automate the Avolve Upgrade",
            unlocked() { return hasAchievement("goals", 73) },
            done() { return hasAchievement("goals", 73) },
            toggles: [["a", "autoAvolve"]],
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "milestones",
        "blank",
        ["display-text", function() { return "<h3>a("+formatWhole(player[this.layer].points)+") = "+format(player[this.layer].value)+"</h3>" }],
        ["display-text", function() { return "a(A) = "+tmp[this.layer].displayFormula }],
        "blank", "blank",
        ["display-text", function() { return tmp[this.layer].bars.Avolve.unlocked?("<h4>"+tmp.a.bars.Avolve.scalingName+"Avolve Level: "+formatWhole(player[this.layer].avolve)+"</h4>"):"" }],
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
