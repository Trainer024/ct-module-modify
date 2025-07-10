import config from "../config"

let said = false

register('guiOpened', () => {
    if (!config.announceMelody) return
    if (said) return
    Client.scheduleTask(1, () => {
        if (Player?.getContainer()?.getName() != 'Click the button on time!') return
        ChatLib.command(`pc ${config.melodyText}`)
        said = true
    })
})

register('chat', (name) => {
    if (name != Player.getName()) return
    said = false
}).setCriteria(/(.+) [activated|completed]+ a terminal! \(\d\/\d\)/)

register('worldLoad', () => {
    said = false
})