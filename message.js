const Discord = require('discord.js');

class Message{

    constructor(){
        this.titles = []
        this.messages = []
    }

    static queueList(u,list){
        this.titles = []
        this.messages = []
        let currentSong = list[0].title
        let songList = ""

        if (list.length > 0){
            for (var i=1; i < list.length; i++){
                songList += ("**" + i + "**. ") + (list[i].title + "\n")
            }

            this.titles.push("Currently Playing:")
            this.titles.push("Next:")
            this.messages.push(currentSong)
            this.messages.push(songList)

            console.log("embedding..")

            // let embedded = embedMessage()

            // console.log("embedded")

            // return embedded
            
        } else {
            
        }
        
    }

    static embedMessage(){
        // let embeddedMsg = {
        //     "color": 16711680,
        //     fields: [
        //         {
        //             name: "Currently Playing:",
        //             value: ""
        //         },
        //         {
        //             name: "Next:",
        //             value: ""
        //         }
        //     ]
        // }
        var embed = new Discord.RichEmbed()
        embed.setColor(16711680)

        for (var i=0; i < this.title.length; i++){
            embed.addField(this.titles[i], this.messages[i])
        }

        console.log("get embed")

        return embed

    }
}

module.exports=Message