import config from "../config"

let tpTime
register('playerInteract', (act, pos, e) => {
	if (!config.sinseekerTimer) return
	if (!Player?.getHeldItem()?.getName()?.removeFormatting()?.includes('Sinseeker Scythe')) return
	tpTime = Date.now()
})

register('renderOverlay', () => {
	if (!config.sinseekerTimer) return
	if (Date.now() - tpTime > 1000 || tpTime == null) return
	new Text(parseInt((1000 - (Date.now() - tpTime)) / 100), Renderer.screen.getWidth() / 2 - 2.5, Renderer.screen.getHeight() / 2 + 8)
		.setShadow(true)
		.setColor(Renderer.GREEN)
		.draw()
})
