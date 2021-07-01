addLayer("goals", {
    name: "goals",
    image: "resources/goal.png",
    row: "side",
    startData() { return {
        unlocked: true,
        achievements: [],
    }},
    tooltip() { return formatWhole(tmp[this.layer].achsCompleted)+" Goals completed" },
    color: "#cbff3b",
    tabFormat: [
        "blank",
        ["display-text", function() { return "<h3>You have completed <span style='color: "+tmp[this.layer].color+"; font-size: 25px;'>"+formatWhole(tmp[this.layer].achsCompleted)+"</span> Goals.</h3>" }],
        "blank", "buyables", 
        "blank", "blank", "blank",
        "achievements",
    ],
    achsCompleted() { return player[this.layer].achievements.length },
    unlocks() { return player[this.layer].buyables[11].toNumber() },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            unlockData: [
                {
                    desc: "Unlock Avolve.",
                    req: 3,
                },
                {
                    desc: "Unlock B-Power",
                    req: 7,
                },
                {
                    desc: "Unlock Batteries",
                    req: 12,
                },
            ],
            retrieveUnlockData() { return tmp[this.layer].buyables[11].unlockData[player[this.layer].buyables[11].toNumber()] },
            title() {
                let data = tmp[this.layer].buyables[11].retrieveUnlockData
                if (!data) return "???";
                else return data.desc;
            },
            display() { 
                let data = tmp[this.layer].buyables[11].retrieveUnlockData
                if (!data) return "???";
                else return "Req: "+formatWhole(data.req)+" Goals";
            },
            canAfford() { 
                let data = tmp[this.layer].buyables[11].retrieveUnlockData
                if (!data) return false;
                return tmp[this.layer].achsCompleted>=data.req
            },
            buy() {
                if (!tmp[this.layer].buyables[11].retrieveUnlockData) return;
                player[this.layer].buyables[11] = player[this.layer].buyables[11].plus(1)
            },
        },
    },
    achievements: {
        11: {
            name: "The Formula is Useful Now!",
            done() { return player.a.points.gte(1) },
            tooltip: "Get 1 A-Power.",
            unlocked() { return true },
        },
        12: {
            name: "Fake Timewall",
            done() { return player.value.gte(50) },
            tooltip: "Make n(t) ≥ 50.",
            unlocked() { return hasAchievement(this.layer, 11) }
        },
        13: {
            name: "Speedy Recovery",
            done() { return player.a.points.gte(10) },
            tooltip: "Reach 10 A-Power. Reward: Increase <span style='font-size: 17.5px;'>a</span> by 0.5.",
            unlocked() { return hasAchievement(this.layer, 11) }
        },
        14: {
            name: "Faster Avolution",
            done() { return tmp.a.bars.Avolve.reqDiv.gt(1) },
            tooltip: "Reduce the Avolve requirement. Reward: The A-Power requirement is divided by 1.5.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        15: {
            name: "A To the Extreme",
            done() { return player.a.value.gte(100) },
            tooltip: "Make a(A) ≥ 100. Reward: Completed Goals multiply <span style='font-size: 17.5px;'>n(t)</span>.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        16: {
            name: "What is even the point anymore?",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(5) },
            tooltip: "Divide the Avolve requirement by 5. Reward: The Avolve Requirement reduction upgrade's effect exponent is increased by 1.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        21: {
            name: "Into the next Generation",
            done() { return player.a.avolve.gte(7) },
            tooltip: "Reach Avolve Level 7. Reward: You can buy max A-Power.",
            unlocked() { return hasAchievement("goals", 14) },
        },
        22: {
            name: "I Feel Strong",
            done() { return player.a.points.gte(40) },
            tooltip: "Reach 40 A-Power. Reward: The A-Power requirement base is decreased by 0.1.",
            unlocked() { return hasAchievement("goals", 15) }
        },
        23: {
            name: "Billionaire!",
            done() { return player.value.gte(1e9) },
            tooltip: "Make n(t) ≥ 1e9. Reward: <span style='font-size: 17.5px;'>b</span> boosts <span style='font-size: 17.5px;'>a</span> at a reduced rate.",
            unlocked() { return tmp[this.layer].unlocks>=2 },
        },
        24: {
            name: "Seriously this upgrade sucks!",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(50) },
            tooltip: "Divide the Avolve requirement by 50. Reward: The Avolve requirement reduction upgrade's effect exponent is increased by 1.",
            unlocked() { return hasAchievement("goals", 16) },
        },
        25: {
            name: "Nice",
            done() { return player.a.points.gte(69) && player.value.gte(6e9) },
            tooltip: "Reach 69 A-Power & make n(t) ≥ 6e9. Reward: B-Power adds to effective A-Power.",
            unlocked() { return tmp[this.layer].unlocks>=2 },
        },
        26: {
            name: "Darwin had it right",
            done() { return player.a.avolve.gte(20) },
            tooltip: "Reach Avolve Level 20. Reward: Getting A-Power resets nothing.",
            unlocked() { return hasAchievement("goals", 21) },
        },
        31: {
            name: "Coursing Through My Veins!",
            done() { return player.b.points.gte(5) },
            tooltip: "Reach 5 B-Power. Reward: The A-Power requirement base is decreased by 0.1.",
            unlocked() { return hasAchievement("goals", 22) && hasAchievement("goals", 23) },
        },
        32: {
            name: "Further Existence",
            done() { return player.a.avolve.gte(30) },
            tooltip: "Reach Avolve Level 30. Reward: Avolve's boost to <span style='font-size: 17.5px;'>a</span> is squared.",
            unlocked() { return hasAchievement("goals", 26) },
        },
        33: {
            name: "A To the More Extreme",
            done() { return player.a.value.gte(1.5e6) },
            tooltip: "Make a(A) ≥ 1,500,000. Reward: Completed Goals boost <span style='font-size: 17.5px;'>a</span>.",
            unlocked() { return tmp[this.layer].unlocks>=3 },
        },
        34: {
            name: "Oct? Non? I don't remember...",
            done() { return player.value.gte(1e27) },
            tooltip: "Make n(t) ≥ 1e27. Reward: Unlock a new set of Batteries, and you can have 2 more active at once.",
            unlocked() { return hasAchievement("goals", 31)&&tmp[this.layer].unlocks>=3 },
        },
        35: {
            name: "Am I Strong?",
            done() { return player.a.points.gte(300) },
            tooltip: "Reach 300 A-Power. Reward: The B-Power base is halved.",
            unlocked() { return hasAchievement("goals", 31) }
        },
        36: {
            name: "I Could Make a Bee Joke, but I can't think of anything...",
            done() { return player.b.points.gte(10) },
            tooltip: "Reach 10 B-Power. Reward: Time goes by 5x faster, but this slows down after 10 seconds.",
            unlocked() { return hasAchievement("goals", 31) },
        },
        41: {
            name: "The Sub-Infinite Sum",
            done() { return player.value.gte(1e40) && player.a.value.gte(6.98e8) },
            tooltip: "Make n(t) ≥ 1e40 & a(A) ≥ 698,000,000. Reward: TBA ;)",
            unlocked() { return hasAchievement("goals", 34) }
        },
    },
    nodeStyle: { width: "50px", height: "50px", "min-width": "50px" },
    componentStyles: {
        achievement: {
            "border-radius": "5%",
        },
        buyable: {
            width: "100px",
            height: "75px",
            "border-radius": "5%",
        },
    },
})