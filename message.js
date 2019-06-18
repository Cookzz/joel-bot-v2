const Discord = require('discord.js');

class Message{

    constructor(){
        this.quoteList = []
        this.titles = []
        this.messages = []
    }

    static queueList(client,list,p,q){
        this.titles = []
        this.messages = []
        this.quoteList = q
        this.pageSize=10

        let maxPage=Math.ceil(list.length/this.pageSize);

        if(((p+1)>maxPage)||(p<0)){

          return "No such page exist."

        }else{
          let songPages = ""
          let embeddedMsg = {}

          if (list.length > 0){
              let currentSong = list[0].title + "\n**Requested By:** " + list[0].member

              if (list.length > 1){
                  let i=0;
                  this.j2j(list).slice(p*this.pageSize,(p+1)*this.pageSize).forEach((s)=>{
                    if(i>0){
                      songPages+=("**" + (p*this.pageSize+i) + "**. ") + (s.title + "\n")
                    }
                    i++
                  })
              } else {
                  songPages="No songs are in queue at the moment"
              }

              this.titles.push("Currently Playing:")
              this.messages.push(currentSong)

              this.titles.push("Next:")
              this.messages.push(songPages)

              console.log("embedding..")

              //get embedded from embedMessage()
              embeddedMsg = this.embedMessage(client,(list.length > 1)?{
                "text":"page "+(p+1)+" of "+Math.ceil(list.length/this.pageSize)
              }:false)
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
    }

    static embedMessage(c,f){
        let emojiName=[];

        c.emojis.map(emoji => {
          if (emoji.name.includes("jsmile")){
            emojiName.push(emoji)
          }
        })

        let no = Math.floor((Math.random() * emojiName.length))
        let j = emojiName[no]

        let quoteNo = Math.floor((Math.random() * this.quoteList.length))
        let q = this.quoteList[quoteNo]

        let embeddedMsg = {
            "title": `${j} - ${q}`,
            "color": 16711680,
            fields: []
        }

        for (var i=0; i < this.titles.length; i++){
            embeddedMsg.fields.push({
                "name": this.titles[i],
                "value": this.messages[i]
            })
        }

        if(f){
          embeddedMsg.footer=f
        }

        return {"embed":embeddedMsg}
    }

    static j2j(j){
      return JSON.parse(JSON.stringify(j));
    }
}

module.exports=Message
