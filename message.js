const Discord = require('discord.js');

class Message{

    constructor(){
        this.titles = []
        this.messages = []
    }

    static queueList(u,list,p){
        this.titles = []
        this.messages = []

        let songPages = []
        let embeddedMsg = {}

        if (list.length > 0){
            let currentSong = list[0].title + "\n**Requested By:** " + list[0].member

            if (list.length > 1){
                songPages = this.addPage(u,list)
            } else {
                songPages.push("No songs are in queue at the moment")
            }

            this.titles.push("Currently Playing:")
            this.titles.push("Next:")
            this.messages.push(currentSong)
            this.messages.push(songPages[0])

            console.log("embedding..")

            //get embedded from embedMessage()
            embeddedMsg = this.embedMessage()
        } else {
            embeddedMsg = {
                "color": 16711680,
                fields: [{
                    "name": "N/A",
                    "value": "No songs are playing at the moment"
                }]
            }
        }

        return embeddedMsg
    }

    static embedMessage(){
        let embeddedMsg = {
            "color": 16711680,
            fields: []
        }

        for (var i=0; i < this.titles.length; i++){
            embeddedMsg.fields.push({
                "name": this.titles[i],
                "value": this.messages[i]
            })
        }

        return embeddedMsg
    }

    static addPage(u,list){
        let songPages = []
        let songList = ""
        let page = 0
        let maxSong = 10

        songPages.push(songList)

        for (var i=1; i < list.length; i++){
            page = songPages.length-1
            songList += ("**" + i + "**. ") + (list[i].title + "\n")

            if (i%maxSong == 0){
                songPages.push(songList)
                maxSong += 10
                songList = ""
            } else {
                songPages[page] = songList
            }
        }

        return songPages
    }
}

module.exports=Message
