import { registerWhen } from "../../BloomCore/utils/Utils"
import config from "../config"
let inP5 = false

registerWhen(register('spawnParticle', (particle) => {
	if (!inP5) return
	if (particle.toString().includes('EntityFlameFX')) return
	particle.remove()
}), () => config.hideParticles)

registerWhen(register('renderEntity', (entity, pos, ticks, event) => {
	if (!inP5) return
	cancel(event)
}).setFilteredClass(Java.type('net.minecraft.entity.item.EntityArmorStand').class), () => config.hideArmorstands)

registerWhen(register('renderEntity', (entity, pos, ticks, event) => {
	cancel(event)
}).setFilteredClass(Java.type("net.minecraft.entity.item.EntityFallingBlock").class), () => config.hideFallingBlocks)

register('worldLoad', () => {
	inP5 = false
})

register('chat', () => {
	inP5 = true
	// ChatLib.command('pq off')
}).setCriteria('[BOSS] Wither King: You.. again?')

register('chat', () => {
	inP5 = false
	// ChatLib.command('pq medium')
}).setCriteria("[BOSS] Wither King: Incredible. You did what I couldn't do myself.")
