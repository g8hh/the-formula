addLayer("int", {
    name: "Int",
    symbol: "&#x222b;",
    position: 0,
    row: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        value: new Decimal(0),
    }},
    nodeStyle() { return { "min-width": "200px", height: "200px", "font-size": "180px", "padding-left": "15px", "padding-right": "15px", "background-color": (colors[options.theme || "default"].background), "border-color": (colors[options.theme || "default"].background), color: (((tmp.timeSpeed||new Decimal(1)).gte(tmp[this.layer].requires)||player[this.layer].unlocked)?"white":"#8a2203"), "box-shadow": "none" }},
    color: "#8a8a8a",
    resource: "集合",
    baseResource: "时间速率",
    baseAmount() { return tmp.timeSpeed||new Decimal(1) },
    type: "static",
    requires: new Decimal(1e7),
    base: new Decimal(10),
    exponent: new Decimal(1),
    layerShown() { return tmp.goals.unlocks>=6 },
    tooltipLocked() { return "要求: 时间速率 ≥ "+formatWhole(tmp[this.layer].requires)+"x" },
    prestigeButtonText() {
        if (!player[this.layer].unlocked) return "重置所有之前的进度来进入集合的王国"
        let text = "重置以获得 <b>"+formatWhole(tmp[this.layer].resetGain)+"</b> 集合<br><br>";
        if (tmp[this.layer].canBuyMax) text += "下一个集合需要: 时间速率 ≥ "+format(tmp[this.layer].nextAtDisp)+"x"
        else text += "需求: 时间速率 ≥ "+format(tmp[this.layer].nextAt)+"x"
        text += "<br>需求底数: "+format(tmp[this.layer].base)
        return text;
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() { return "<h3>IP("+formatWhole(player[this.layer].points)+") = "+format(player[this.layer].value)+"</h3>" }],
        ["display-text", function() { return "IP(I) = "+tmp[this.layer].displayFormula }],
        "blank", "blank",
    ],
    update(diff) {
        player.int.value = tmp.int.calculateValue
    },
    calculateValue(I = player.int.points) {
        return I.times(2).times(player.value.max(10).log10().log10().plus(1));
    },
    displayFormula() {
        let f = "2 × I × (log(log(n(t)) + 1)"
        return f;
    },
})