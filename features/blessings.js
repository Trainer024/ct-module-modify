import Font from '../../FontLib'
import { data } from './data'
import { isInDungeon, romanToInt } from './utils/utils'
import config from '../config'
import { registerWhen } from '../../BloomCore/utils/Utils'

const font2 = new Font('AzuredClient/features/utils/Roboto-Medium.ttf', 23)

const blessings = {
	power: /Blessing of Power (.+)/,
	time: /Blessing of Time (.+)/,
	life: /Blessing of Life (.+)/,
	wisdom: /Blessing of Wisdom (.+)/,
	stone: /Blessing of Stone (.+)/,
}

let powerMatch
let timeMatch
let lifeMatch
let wisdomMatch
let stoneMatch

register('step', () => {
	if (config.showBlessings) {
		let footer = TabList?.getFooter()?.removeFormatting()
		if (!footer) return

		if (config.showPower) {
			powerMatch = footer.match(blessings.power)
		} else powerMatch = null
		if (config.showTime) {
			timeMatch = footer.match(blessings.time)
		} else timeMatch = null
		if (config.showWisdom) {
			wisdomMatch = footer.match(blessings.wisdom)
		} else wisdomMatch = null
		if (config.showLife) {
			lifeMatch = footer.match(blessings.life)
		} else lifeMatch = null
		if (config.showStone) {
			stoneMatch = footer.match(blessings.stone)
		} else stoneMatch = null

	}
}).setFps(2)

registerWhen(register('renderOverlay', () => {

	let i = 1

	if (powerMatch) {
		font2.drawStringWithShadow(`Power: §f${romanToInt(powerMatch[1])}`, data.powerCoords.x, data.powerCoords.y, config.hudColor)
	}
	if (wisdomMatch) {
		font2.drawStringWithShadow(`Wisdom: §f${romanToInt(wisdomMatch[1])}`, data.powerCoords.x, data.powerCoords.y + 11 * i++, config.hudColor)
	}
	if (timeMatch) {
		font2.drawStringWithShadow(`Time: §f${romanToInt(timeMatch[1])}`, data.powerCoords.x, data.powerCoords.y + 11 * i++, config.hudColor)
	}
	if (lifeMatch) {
		font2.drawStringWithShadow(`Life: §f${romanToInt(lifeMatch[1])}`, data.powerCoords.x, data.powerCoords.y + 11 * i++, config.hudColor)
	}
	if (stoneMatch) {
		font2.drawStringWithShadow(`Stone: §f${romanToInt(stoneMatch[1])}`, data.powerCoords.x, data.powerCoords.y + 11 * i++, config.hudColor)

	}

}), () => config.showBlessings && !config.blessingsGui.isOpen() && isInDungeon())

registerWhen(register('renderOverlay', () => {

	font2.drawStringWithShadow(
		`Power: §f29`,
		data.powerCoords.x,
		data.powerCoords.y,
		config.hudColor
	)

	font2.drawStringWithShadow(
		`Time: §f5`,
		data.powerCoords.x,
		data.powerCoords.y + 11,
		config.hudColor
	)
}), () => config.blessingsGui.isOpen())

register("dragged", (dx, dy, x, y) => {
	if (!config.blessingsGui.isOpen()) return
	data.powerCoords.x = x
	data.powerCoords.y = y
	data.save()
})
