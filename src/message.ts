import { Embed, EmbedBuilder, type APIEmbedField } from 'discord.js'
import type { EmbeddedMessage } from "./types/embedded-message.type";
import type { MusicDetails } from "./types/music-details.type";
import { j2j } from "./utils/common.util";

const quoteList = [
  "Why lah bro",
  "ER Diagram is my life",
  "Love, Joel Mathew",
  "Hi. I am Joel.",
  "Invaded by ERDark spirit Joel Mathew"
];

//TODO: this is still old code, refactoring will be required soon
class Message {
    public titles: any[];
    public messages: any[];

    constructor(){
        this.titles = []
        this.messages = []
    }

    public queueList(client: any, list: any[], p: number, q: any[]){
        this.titles = []
        this.messages = []
        
        const pageSize = 10

        let maxPage=Math.ceil(list.length/pageSize);

        if(
          ((p+1)>maxPage) ||
          (p<0))
        {

          return "No such page exist."

        } else {
          let songPages = ""
          let embeddedMsg = {}

          if (list.length > 0){
              let currentSong = list[0].details.title + "\n**Requested By:** " + list[0].member
              //console.log("song list ", list)
              if (list.length > 1){
                  let i=0;
                  j2j(list).slice(p*pageSize,(p+1)*pageSize).forEach((s: any)=>{
                    if(i>0){
                      songPages+=("**" + (p*pageSize+i) + "**. ") + (s.details.title + "\n")
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
                "text":"page "+(p+1)+" of "+Math.ceil(list.length/pageSize)
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

    public getSongInfo(songInfo: MusicDetails): EmbedBuilder{
      const j = "Joel Bot"
      const quoteNo = Math.floor((Math.random() * quoteList.length))
      const q = quoteList[quoteNo]
      const thumbnailUrl = songInfo?.details?.thumbnail_url ?? null

      const fields: APIEmbedField[] = [
        { name: "Author: ", value: songInfo.details.author.name, inline: false },
        { name: "Video Duration: ", value: songInfo.details.duration, inline: false },
        { name: "Requested By: ", value: songInfo.member, inline: false }
      ]

      let embedded = new EmbedBuilder()
                          .setAuthor({ name: `${j} - ${q}`})
                          .setTitle(`${songInfo.details.title}`)
                          .setURL(songInfo.url)
                          .setColor(6910463)
                          .addFields(fields)
      
      if (thumbnailUrl){
        embedded.setImage(thumbnailUrl)
      }

      return embedded
    }

    //this is no longer necessary, soon to deprecate
    public embedMessage(f: any, tn: any){
        let emojiName: any[] = [];

        let no = Math.floor((Math.random() * emojiName.length))
        let j = emojiName[no] || "Joel Bot"

        let quoteNo = Math.floor((Math.random() * quoteList.length))
        let q = quoteList[quoteNo]

        let embeddedMsg: EmbeddedMessage = {
            "title": `${j} - ${q}`,
            "color": 6910463,
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

        if (tn){
            embeddedMsg.image = {
                "url": tn
            }
        }

        return {"embed":embeddedMsg}
    }
}

export default Message