import config from '../config'
import { isInDungeon } from './utils/utils'

register('chat', (message) => {
    if (!isInDungeon()) return
    if (!config.deathMessage) return
    if (message.includes('reconnected') || message.includes('Cata Level')) return
    if ((message.includes('You') || message.includes(Player.getName())) && config.ownDeathMessage) return

    let deathMessageText = config.deathMessageText
    if (deathMessageText.includes('{name}')) {
        deathMessageText = deathMessageText.replace(/{name}/g, name)
    }

    if (deathMessageText.includes(',')) {
        messagesArray = deathMessageText.split(',')
        // Randomise message
        deathMessageText = messagesArray[Math.floor(Math.random() * messagesArray.length)]
    }
    ChatLib.command(`pc ${deathMessageText}`)
}).setCriteria(/^ ☠ (.+)/)