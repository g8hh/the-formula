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
        ["display-text", function() { return "<h3>您已经完成 <span style='color: "+tmp[this.layer].color+"; font-size: 25px;'>"+formatWhole(tmp[this.layer].achsCompleted)+"</span> 个成就.</h3>" }],
        "blank", "buyables", 
        "blank", "blank", "blank",
        "achievements",
    ],
    goal36power() { 
        let power = new Decimal(hasAchievement("goals", 42)?2:1);
        if (hasAchievement("goals", 45) && tmp.b.batteriesUnl) power = power.times(gridEffect("b", 203));
        if (hasAchievement("goals", 54)) power = power.times(3)
        if (hasAchievement("goals", 71)) power = power.times(3.6)
        return power;
    },
    goal36decayrate() {
        let rate = new Decimal(hasAchievement("goals", 42)?(1/4):1);
        if (hasAchievement("goals", 54)) rate = rate.times(10)
        if (hasAchievement("goals", 71)) rate = rate.times(2)
        return rate.times(tmp.goals.goal36power)
    },
    goal36eff() {
        let pow = tmp.goals.goal36power
		let decay = tmp.goals.goal36decayrate
		let p = player.points.times(decay);
		if (p.gte(50)) p = p.div(2).plus(25);
		if (p.gte(65)) p = p.div(2).plus(32.5);
		if (p.gte(75)) p = p.times(5625).cbrt();
		return Decimal.sub(pow.times(5), p.max(10).sub(10).div(20)).max(1);
    },
    achsCompleted() { return player[this.layer].achievements.length },
    unlocks() { return player[this.layer].buyables[11].toNumber() },
    buyables: {
        rows: 1,
        cols: 1,
        11: {
            unlockData: [
                {
                    desc: "解锁进化.",
                    req: 3,
                },
                {
                    desc: "解锁B能量",
                    req: 7,
                },
                {
                    desc: "解锁电池",
                    req: 12,
                },
                {
                    desc: "解锁C能量",
                    req: 19,
                },
                {
                    desc: "解锁钟",
                    req: 27,
                },
                {
                    desc: "解锁集合",
                    req: 37,
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
                else return "要求: "+formatWhole(data.req)+" 成就";
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
            name: "公式有用了!",
            done() { return player.a.points.gte(1) },
            tooltip: "获得1个A能量.",
            unlocked() { return true },
        },
        12: {
            name: "虚假的时间墙",
            done() { return player.value.gte(50) },
            tooltip: "让 n(t) ≥ 50.",
            unlocked() { return hasAchievement(this.layer, 11) }
        },
        13: {
            name: "再获速度",
            done() { return player.a.points.gte(10) },
            tooltip: "达到 10 A能量. 奖励: 让 <span style='font-size: 17.5px;'>a</span> 增加 0.5.",
            unlocked() { return hasAchievement(this.layer, 11) }
        },
        14: {
            name: "更快进化",
            done() { return tmp.a.bars.Avolve.reqDiv.gt(1) },
            tooltip: "降低进化要求. 奖励: A能量要求/1.5.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        15: {
            name: "趋向极限值!",
            done() { return player.a.value.gte(100) },
            tooltip: "让 a(A) ≥ 100. Reward: 已完成的成就倍增 <span style='font-size: 17.5px;'>n(t)</span>.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        16: {
            name: "点数在哪?",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(5) },
            tooltip: "让进化要求/5. 奖励: 降低进化要求的升级的效果指数+1.",
            unlocked() { return tmp[this.layer].unlocks>=1 },
        },
        21: {
            name: "达到新一代",
            done() { return player.a.avolve.gte(7) },
            tooltip: "达到7级进化. 奖励: 您可以购买最大A能量.",
            unlocked() { return hasAchievement("goals", 14) },
        },
        22: {
            name: "我感到了力量",
            done() { return player.a.points.gte(40) },
            tooltip: "达到 40 A能量. 奖励: A能量要求底数-0.1.",
            unlocked() { return hasAchievement("goals", 15) }
        },
        23: {
            name: "百万富翁!",
            done() { return player.value.gte(1e9) },
            tooltip: "让 n(t) ≥ 1e9. 奖励: <span style='font-size: 17.5px;'>b</span> 以一个较低的效率加成 <span style='font-size: 17.5px;'>a</span>.",
            unlocked() { return tmp[this.layer].unlocks>=2 },
        },
        24: {
            name: "震惊，这个升级没用了!",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(50) },
            tooltip: "让进化要求/50. 奖励: 这个升级的效果指数再次+1.",
            unlocked() { return hasAchievement("goals", 16) },
        },
        25: {
            name: "漂亮.",
            done() { return player.a.points.gte(69) && player.value.gte(6e9) },
            tooltip: "达到 69 A能量 & 让 n(t) ≥ 6e9. 奖励: B能量加算到A能量里.",
            unlocked() { return tmp[this.layer].unlocks>=2 },
        },
        26: {
            name: "达尔文是正确的",
            done() { return player.a.avolve.gte(20) },
            tooltip: "达到20级进化. 奖励: A能量不再重置任何东西.",
            unlocked() { return hasAchievement("goals", 21) },
        },
        31: {
            name: "穿过我的血管!",
            done() { return player.b.points.gte(5) },
            tooltip: "达到 5 B能量. 奖励: A能量要求底数-0.1.",
            unlocked() { return hasAchievement("goals", 22) && hasAchievement("goals", 23) },
        },
        32: {
            name: "更远的存在",
            done() { return player.a.avolve.gte(30) },
            tooltip: "达到30级进化. 奖励: 进化对 <span style='font-size: 17.5px;'>a</span> 的效果变为其平方.",
            unlocked() { return hasAchievement("goals", 26) },
        },
        33: {
            name: "更趋向极限值!",
            done() { return player.a.value.gte(1.5e6) },
            tooltip: "让 a(A) ≥ 1,500,000. 奖励: 已完成的成就加成 <span style='font-size: 17.5px;'>a</span>.",
            unlocked() { return tmp[this.layer].unlocks>=3 },
        },
        34: {
            name: "亿的六次方? 亿的七次方? 记不清了...",
            done() { return player.value.gte(1e27) },
            tooltip: "让 n(t) ≥ 1e27. 奖励: 解锁一些新的电池，你可以同时使用两个电池.",
            unlocked() { return hasAchievement("goals", 31)&&tmp[this.layer].unlocks>=3 },
        },
        35: {
            name: "我强大么?",
            done() { return player.a.points.gte(300) },
            tooltip: "达到 300 A能量. 奖励: B能量的底数/2.",
            unlocked() { return hasAchievement("goals", 31) }
        },
        36: {
            name: "绝对是蜜蜂笑话",
            done() { return player.b.points.gte(10) },
            tooltip() { 
                return "达到 10 B能量. 奖励: 时间快 "+format(tmp.goals.goal36power.times(5))+"x , 但在大于 "+format(Decimal.div(10, tmp.goals.goal36decayrate))+" 秒时变慢.<br>当前: "+format(tmp.goals.goal36eff)+"x" 
            },
            unlocked() { return hasAchievement("goals", 31) },
        },
        41: {
            name: "次无限之和",
            done() { return player.value.gte(1e40) && player.a.value.gte(6.98e8) },
            tooltip: "让 n(t) ≥ 1e40 & a(A) ≥ 698,000,000. 奖励: A能量底数-0.05.",
            unlocked() { return hasAchievement("goals", 34) }
        },
        42: {
            name: "参考那个蜜蜂电影",
            done() { return player.b.points.gte(15) },
            tooltip: '达到 15 B能量. 奖励: "绝对是蜜蜂笑话" 的效果x2 & 效果减弱速率/4.',
            unlocked() { return hasAchievement("goals", 36) },
        },
        43: {
            name: "未充能",
            done() { return player.value.gte(1e75) && tmp.b.usedBatteries==0 },
            tooltip: "在不使用任何电池的情况下让 n(t) ≥ 1e75. 奖励: 你可以额外激活一个电池.",
            unlocked() { return hasAchievement("goals", 35) && hasAchievement("goals", 36) && tmp[this.layer].unlocks>=3 },
        },
        44: {
            name: "我感觉像是在赌博",
            done() { return player.a.points.gte(888) },
            tooltip: "达到 888 A能量. 奖励: B能量对A能量效果的加成改完乘以而不是相加.",
            unlocked() { return hasAchievement("goals", 41) },
        },
        45: {
            name: "如果大数只是一个游戏内容...",
            done() { return player.value.gte(1e100) },
            tooltip: "让 n(t) ≥ 1e100. 奖励: 第二行电池有自己独特的效果.",
            unlocked() { return hasAchievement("goals", 43) },
        },
        46: {
            name: "啊我明白了",
            done() { return player.c.points.gte(4) },
            tooltip: "达到 4 C能量. 奖励: 三倍化 <span style='font-size: 17.5px;'>c</span> 在 n(t) 里的效果.",
            unlocked() { return hasAchievement("goals", 44) && tmp[this.layer].unlocks>=4 },
        },
        51: {
            name: "这仍然没有哪怕半点作用",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(3e5) },
            tooltip: "让进化要求/300,000. 奖励: 该升级的效果指数加上已完成的成就数.",
            unlocked() { return hasAchievement("goals", 24) && hasAchievement("goals", 36) },
        },
        52: {
            name: "哇那是成吨的伤害!",
            done() { return player.a.points.gte(2e3) },
            tooltip: "达到 2,000 A能量. 奖励: 你可以自动获取 A能量, 同时它的获取底数-0.05.",
            unlocked() { return hasAchievement("goals", 44) }
        },
        53: {
            name: "20%的宽恕(注:要求是1.80e308^(1-20%))",
            done() { return player.value.gte(Math.pow(Number.MAX_VALUE, 0.8)) },
            tooltip() { return "让 n(t) ≥ "+format(Math.pow(Number.MAX_VALUE, 0.8))+". 奖励: 你可以额外开启一个电池, 同时第三排电池也有自己独特的效果了." },
            unlocked() { return hasAchievement("goals", 45) },
        },
        54: {
            name: "疯狂-B",
            done() { return player.a.value.gte(1.5e17) },
            tooltip: '让 a(A) ≥ 1.5e17. 奖励: 进化的折算延迟25级, 同时 "绝对是蜜蜂笑话" 的效果x3,削减速度/10.',
            unlocked() { return hasAchievement("goals", 42) && hasAchievement("goals", 51) },
        },
        55: {
            name: "巴斯光年是一个远见者",
            done() { return player.value.gte(Number.MAX_VALUE) },
            tooltip: "让 n(t) ≥ "+format(Number.MAX_VALUE)+".",
            unlocked() { return hasAchievement("goals", 53) },
        },
        56: {
            name: "真正的一日",
            done() { return tmp.c.clockRatio.times(tmp.c.hoursPerDay).gte(24) },
            tooltip: "让钟表显示24:00:00及以上. 奖励: 一天的长度/2.",
            unlocked() { return hasAchievement("goals", 54) && tmp.goals.unlocks>=5}
        },
        61: {
            name: "断货了?",
            done() { return player.b.points.gte(30) && player.c.points.gte(7) },
            tooltip: '达到 30 B能量 & 7 C能量. 奖励: 每个钟中的一天会使其自身效果+0.1 (不随时间削减).',
            unlocked() { return hasAchievement("goals", 52) && tmp.goals.unlocks>=5}
        },
        62: {
            name: "回来拿这个成就了?",
            done() { return player.a.avolve.gte(308) },
            tooltip: "达到进化等级 308. 奖励: 时间速率x2, 同时 <span style='font-size: 17.5px;'>a</span> 的对数加算到 n(t) 中的 <span style='font-size: 17.5px;'>t</span> 的指数里.",
            unlocked() { return hasAchievement("goals", 61) },
        },
        63: {
            name: "太阳系钟摆",
            done() { return layers.c.clockRatio().times(tmp.c.hoursPerDay).gte(2) && tmp.b.usedBatteries==0 },
            tooltip: "在不激活电池的情况下让钟显示2:00:00. 奖励: 一天的长度/2, 天数不再衰减, 当一天过去时, 钟不会重置.",
            unlocked() { return hasAchievement("goals", 56) },
        },
        64: {
            name: "额，加拿大人?",
            done() { return player.a.points.gte(105e3) },
            tooltip: "达到 105,000 A能量. 奖励: <span style='font-size: 17.5px;'>c</span> 加算到 b(B).",
            unlocked() { return hasAchievement("goals", 62) && tmp.goals.unlocks>=4 },
        },
        65: {
            name: "我猜那个不再是没用的了...",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(1e55) },
            tooltip: "让进化的需求/1e55. 奖励: 这个升级的等级加算到这个升级的指数中, A能量以更强的公式加成a(A), 双倍化时间速率.",
            unlocked() { return hasAchievement("goals", 56) && hasAchievement("goals", 62) },
        },
        66: {
            name: "真正的一年",
            done() { return tmp.c.clockRatio.times(tmp.c.hoursPerDay).gte(8765.76) },
            tooltip: "让钟至少显示 8,765:45:36. 奖励: 成就倍增时间速率, 但时间速率/4. 同时, 一天的长度又又被减半了.",
            unlocked() { return hasAchievement("goals", 56)}
        },
        71: {
            name: "最leet的函数(注:leet是黑客语言,对应1337)",
            done() { return player.value.gte("1e1337") },
            tooltip: "让 n(t) ≥ "+format("1e1337")+'. 奖励: "绝对是蜜蜂笑话" 的奖励x3.6但衰减速度x2.',
            unlocked() { return hasAchievement("goals", 55) && hasAchievement("goals", 64) },
        },
        72: {
            name: "新社会",
            done() { return player.int.value.gte(8) },
            tooltip: "达到 8 IP. 奖励: IP 倍增时间速率.",
            unlocked() { return hasAchievement("goals", 61) && player.int.unlocked },
        },
        73: {
            name: "没有半点用的QoL.",
            done() { return tmp.a.bars.Avolve.reqDiv.gte(1e100) },
            tooltip: "让进化的要求/1e100. 奖励: 降低进化要求的升级可以被自动并批量购买. 同时, 它的效果指数被IP加成.",
            unlocked() { return hasAchievement("goals", 65) && player.int.unlocked },
        },
        74: {
            name: "强制赦免",
            done() { return player.int.points.gte(2) },
            tooltip: "获得 2 集合. 奖励: 你可以购买最大B能量, 同时B能量的折算减弱20%.",
            unlocked() { return hasAchievement("goals", 71) && player.int.unlocked },
        },
        75: {
            name: "参考那个海洋电影",
            done() { return player.c.points.gte(15) },
            tooltip: "达到 15 C能量. 奖励: 天数可以批量获取, 一天的长度除以你的集合.",
            unlocked() { return hasAchievement("goals", 66) && player.int.unlocked },
        }, 
        76: {
            name: "盐和电池",
            done() { return gridEffect("b", 102).gte(4795) },
            tooltip: "让 B<sub>102</sub> 的效果至少达到 4,795. 奖励: 你可以额外使用3个电池, 同时平方最左侧的电池效果.",
            unlocked() { return hasAchievement("goals", 72) },
        },
        81: {
            name: "你多nice(69)啊!",
            done() { return player.b.value.gte(69) },
            tooltip: "让 b(B) ≥ 69. 奖励: 进化级别的折算减弱50%, IP加算进B, 经过的每一天倍增自身效果0.25%.",
            unlocked() { return hasAchievement("goals", 73) },
        },
        82: {
            name: "断货了 II",
            done() { return player.value.gte("1e3000") },
            tooltip: '让 n(t) ≥ 1e3000. 奖励: 每个该行的成就使C能量的折算延迟一个, 同时可以批量获得进化等级.',
            unlocked() { return hasAchievement("goals", 55) && hasAchievement("goals", 64) },
        },
        83: {
            name: "这是无穷吗?",
            done() { return player.int.value.gte(27.5) },
            tooltip: "达到 27.5 IP. 奖励: 集合倍增 b.",
            unlocked() { return hasAchievement("goals", 72) },
        },
        84: {
            name: "漂亮的成就 #420",
            done() { return player.value.gte("1e6969") },
            tooltip: "让 n(t) ≥ 1e6969. 奖励: 加倍第二行电池效果.",
            unlocked() { return hasAchievement("goals", 76) },
        },
        85: {
            name: "我猜你是活得最充实的?",
            done() { return tmp.c.clockRatio.times(tmp.c.hoursPerDay).gte(1e9) },
            tooltip: "让钟至少显示 1e9:00:00. 奖励: 等下一次更新吧 ;)",
            unlocked() { return hasAchievement("goals", 81) },
        },
    },
    nodeStyle: { width: "50px", height: "50px", "min-width": "50px" },
    componentStyles: {
        achievement: {
            "border-radius": "5%",
        },
        buyable: {
            "min-width": "100px",
            height: "75px",
            "border-radius": "5%",
        },
    },
})