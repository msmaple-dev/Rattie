const {clientId} = require("../../config.json");

function unpinChannelPins(channel){
    channel?.messages.fetchPinned().then((pinnedMessages) => {
        pinnedMessages.forEach((msg) => {
            if(msg.author.id == clientId){
                msg.unpin().catch(console.error)
            }
        })
    }).catch(console.error)
}

function unpinLatestEmbed(channel){
    channel?.messages?.fetchPinned().then((pinnedMessages) => {
        let filteredPins = pinnedMessages.filter(msg => msg.embeds?.length > 0 && msg.author.id == clientId);
        console.log(filteredPins[0])
        filteredPins.values().next().value.unpin().catch(console.error)
    }).catch(console.error)
}

module.exports = { unpinChannelPins, unpinLatestEmbed }