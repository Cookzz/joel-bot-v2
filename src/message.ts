import type { EmbeddedMessage } from "./types/embedded-message.type";
import { j2j } from "./utils/common.util";

class Message {
    public quoteList: any[];
    public titles: any[];
    public messages: any[];

    constructor(){
        this.quoteList = []
        this.titles = []
        this.messages = []
    }

    public queueList(client: any, list: any[], p: number, q: any[]){
        this.titles = []
        this.messages = []
        this.quoteList = q
        
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

    public getSongInfo(songInfo: any, q: any[]){
        this.quoteList = q
        this.titles = []
        this.messages = []

        this.titles.push("Title:")
        this.messages.push("["+songInfo.details.title+"]("+songInfo.url+")")
        if(songInfo.details.author){
          this.titles.push("Author:")
          this.messages.push(songInfo.details.author)
  
          this.titles.push("Video Duration:")
          this.messages.push(songInfo.details.duration)
  
          this.titles.push("Requested By:")
          this.messages.push(songInfo.member)
        }else{
          this.titles.push("Other Detail still loading!")
          this.messages.push('try again later')
        }
        

        let embedded = this.embedMessage(false,(songInfo.details.thumbnail_url)?songInfo.details.thumbnail_url:false)

        return embedded
    }

    public embedMessage(f: any, tn: any){
        let emojiName: any[] = [];

        let no = Math.floor((Math.random() * emojiName.length))
        let j = emojiName[no] || "Joel Bot"

        let quoteNo = Math.floor((Math.random() * this.quoteList.length))
        let q = this.quoteList[quoteNo]

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