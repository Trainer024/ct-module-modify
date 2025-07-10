import { registerWhen } from "../../BloomCore/utils/Utils"
import { romanToInt } from './utils/utils'
import config from "../config"

const S2APacketParticles = Java.type('net.minecraft.network.play.server.S2APacketParticles')

const dragonTexts = new Map([
    ['o', '&l&6ORANGE'],
    ['g', '&l&aGREEN'],
    ['r', '&l&cRED'],
    ['b', '&l&bBLUE'],
    ['p', '&l&5PURPLE'],
])

let spawningDragons = []
let shouldAlert = false
let isInP5 = false
let spawnedTime = 0
let firstDragonsSpawned = false

let playerClass = 'EMPTY'

let timeText = new Text('').setScale(2).setShadow(true).setAlign('CENTER')
let text = new Text('').setScale(3.8).setShadow(true).setAlign('CENTER');

let totalPower = 0;

register('chat', () => {
    if (!config.dragonSplit) return
    isInP5 = true
    shouldAlert = true
    playerClass = getClass()
    getPower()
}).setCriteria('[BOSS] Wither King: You.. again?')

register('worldLoad', () => {
    if (!config.dragonSplit) return
    isInP5 = false
    shouldAlert = false
    spawningDragons = []
    firstDragonsSpawned = false
})

registerWhen(register("packetReceived", (packet) => {
    let count = packet.func_149222_k()
    let type = packet.func_179749_a().toString()
    let isLongDistance = packet.func_179750_b()
    let speed = packet.func_149227_j()
    let x = parseInt(packet.func_149220_d())
    let xOffset = packet.func_149221_g()
    let y = parseInt(packet.func_149226_e())
    let yOffset = packet.func_149224_h()
    let z = parseInt(packet.func_149225_f())
    let zOffset = packet.func_149223_i()

    if (count != 20 || y != 19 || type != "FLAME" || xOffset != 2 || yOffset != 3 || zOffset != 2 || speed != 0 || !isLongDistance) return

    handleDragonSpawns(x, z)

    if (playerClass == 'EMPTY') return

    if (!firstDragonsSpawned) {
        if (spawningDragons.length == 2) {
            text.setString(dragonTexts.get(sortPrio(spawningDragons)))
            if (shouldAlert) {
                World.playSound("note.pling", 1.0, 2.0);
                if (config.dragonTimer) {
                    spawnedTime = Date.now()
                    timerRenderer.register()
                    setTimeout(() => {
                        timerRenderer.unregister()
                    }, 5000)
                }
                dragonText.register()
                setTimeout(() => {
                    dragonText.unregister()
                }, 2000)
                shouldAlert = false
                setTimeout(() => {
                    spawningDragons = []
                    firstDragonsSpawned = true
                }, 6000)
            }
        }
    } else {
        if (!config.showAllDragons || !shouldAlert) return
        text.setString(dragonTexts.get(spawningDragons[0]))
        World.playSound("note.pling", 1.0, 2.0);
        if (config.dragonTimer) {
            spawnedTime = Date.now()
            timerRenderer.register()
            setTimeout(() => {
                timerRenderer.unregister()
            }, 5000)
        }
        dragonText.register()
        setTimeout(() => {
            dragonText.unregister()
        }, 2000)
        shouldAlert = false
        setTimeout(() => {
            spawningDragons = []
        }, 6000)
    }
}).setFilteredClass(S2APacketParticles), () => config.dragonSplit && isInP5)

const dragonText = register('renderOverlay', () => {
    text.draw((Renderer.screen.getWidth()) / 2, (Renderer.screen.getHeight()) / 2 - 40)
}).unregister()

const timerRenderer = register('renderOverlay', () => {
    let spawningTime = Math.max((5000 - (Date.now() - spawnedTime)), 0)
    timeText.setString(spawningTime > 3000 ? `&a${spawningTime}` : (spawningTime >= 1000 ? `&e${spawningTime}` : `&c${spawningTime}`))
    timeText.draw((Renderer.screen.getWidth()) / 2, (Renderer.screen.getHeight()) / 2 + 20)
}).unregister()

function handleDragonSpawns(x, z) {
    if (x >= 27 && x <= 32) {
        if (z == 59) { // Red
            addDrag('r')
        }
        if (z == 94) { // Green
            addDrag('g')
        }
    } else if (x >= 79 && x <= 85) {
        if (z == 94) { // Blue
            addDrag('b')
        }

        if (z == 56) { // Orange
            addDrag('o')
        }

    } else if (x == 56) { // Purple
        addDrag('p')
    }
}

function sortPrio(spawningDragons) {
    spawningDragons.sort((first, second) => {
        let prioList;
        if (totalPower >= config.power || (spawningDragons.includes('p') && totalPower >= config.easyPower)) {
            prioList = ('BerserkMage'.includes(playerClass)) ? Array.from(dragonTexts.keys()) : Array.from(dragonTexts.keys()).reverse()
        } else prioList = 'robpg'.split('')

        let firstPrio = prioList.indexOf(first)
        let secondPrio = prioList.indexOf(second)
        if (totalPower >= config.easyPower) {
            if (config.soloDebuff == 1) {
                if (playerClass.includes('Tank') && spawningDragons.includes('p')) return secondPrio - firstPrio
            } else {
                if (playerClass.includes('Healer') && spawningDragons.includes('p')) return secondPrio - firstPrio
            }
        }
        return firstPrio - secondPrio
    })
    return spawningDragons[0]
}

function addDrag(drag) {
    if (spawningDragons.includes(drag)) return
    spawningDragons.push(drag)
    shouldAlert = true
}

function getClass() {
    let index = TabList?.getNames()?.findIndex(line => line?.includes(Player.getName()))
    if (index == -1) return
    let match = TabList?.getNames()[index]?.removeFormatting().match(/.+ \((.+) .+\)/)
    if (!match) return "EMPTY"
    return match[1];
}

function getPower() {
    let footer = TabList?.getFooter()?.removeFormatting()
    powerMatch = footer.match(/Blessing of Power (.+)/)
    timeMatch = footer.match(/Blessing of Time (.+)/)

    if (!powerMatch) return
    totalPower = romanToInt(powerMatch[1])
    timeMatch ? totalPower += 2.5 : totalPower
    config.paulBuff ? totalPower *= 1.25 : totalPower
}

// Shared Prio for some reason?? Idk who uses this
register('chat', (ign, paul, solo, easy, power, event) => {
    if (!config.dragonSplit) return
    if (ign == Player.getName()) {
        new Message(new TextComponent(`&6[&bAzuredClient&6]&a Successfully shared your priority config. Hover for info.`)
            .setHover("show_text", `&6Shared your config:
&cPaul Buff:&6 ${paul}
&cSolo Debuff:&6 ${solo == 0 ? 'Tank' : 'Healer'}
&cEasy Power:&6 ${easy}
&cPower:&6 ${power}`)).chat()
        cancel(event)
        return
    }
    new Message(new TextComponent(`&6[&bAzuredClient&6] ${ign} &6is sharing their priority config! Click to import it. Hover for more info.`)
        .setHover("show_text", `&6Click to import this config:
&cPaul Buff:&6 ${paul}
&cSolo Debuff:&6 ${solo == 0 ? 'Tank' : 'Healer'}
&cEasy Power:&6 ${easy}
&cPower:&6 ${power}`)
        .setClickValue(`/importprio ${paul} ${solo} ${easy} ${power}`).setClickAction('run_command')).chat()
    cancel(event)
}).setCriteria(/Party > (?:(?:\[.+\]))? ?(.+) ?[ቾ⚒]?: !sharedprio: Paul: (true|false) \| Solo Debuff: ([01]) \| Easy Power: (\d+) \| Power: (\d+)/)

function error() {
    ChatLib.chat("&6[&bAzuredClient&6]&c There was an error importing this config.")
}

register('command', (paul, solo, easy, power) => {
    if (paul != 'true' && paul != 'false') { // Anti Stupid, i can already see people using this command manually and importing some dumb shit
        error()
        return
    }
    if (solo != 0 && solo != 1) {
        error()
        return
    }
    if (!(easy >= 10 && easy <= 29)) {
        error()
        return
    }
    if (!(power >= 10 && power <= 29)) {
        error()
        return
    }
    config.paulBuff = paul === "true";
    config.soloDebuff = solo;
    config.easyPower = easy;
    config.power = power;
    ChatLib.chat("&6[&bAzuredClient&6]&a Successfully imported new priority.")
}).setName('importprio')

register('command', () => {
    config.sharePrio()
}).setName('shareprio')