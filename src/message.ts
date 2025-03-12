import { Embed, EmbedBuilder, type APIEmbedField, type APIEmbedFooter } from 'discord.js'
import type { EmbeddedMessage } from "./types/embedded-message.type";
import type { MusicDetails } from "./types/music-details.type";
import { getDuration, j2j } from "./utils/common.util";

const quoteList = [
  "Why lah bro",
  "ER Diagram is my life",
  "Love, Joel Mathew",
  "Hi. I am Joel.",
  "Invaded by ERDark spirit Joel Mathew"
];

class Message {
    public getQueueList(list: MusicDetails[], pageNo: number): EmbedBuilder{
      const j = "Joel Bot"
      const quoteNo = Math.floor((Math.random() * quoteList.length))
      const q = quoteList[quoteNo]

      const pageSize = 10
      const maxPage = Math.ceil(list.length / pageSize);

      const durationList = list.map((song)=>(song.details.duration))
      const duration = getDuration(durationList)

      const currentSong = `${list[0].details.title}\n**Requested By:** ${list[0].member}`

      const fields: APIEmbedField[] = [{
        name: "Currently Playing:",
        value: currentSong
      }]

      const footer: APIEmbedFooter = {
        text: `Page ${pageNo}/${maxPage}. Duration: ${duration}`
      }

      if (list.length > 1){
        // calculate total items we need to "see" within a page -> calculate numbering each item per page -> map accordingly
        const pageStartItem = (pageNo > 1) ? pageNo * pageSize : pageNo
        const pageEndItem = (pageNo > 1) ? (pageNo+1) * pageSize : pageNo * pageSize
        const pageItem = (pageNo > 1) ? (pageNo-1) * pageSize : pageNo
        
        const songList = list.slice(pageStartItem, pageEndItem)
                            .map((song: MusicDetails, i: number) => (`**${(pageItem)+i}**. ${song.details.title}\n`))
                            .join("")
        
        fields.push({
          name: "Next:",
          value: songList
        })
      } else {
        fields.push({
          name: "Next:",
          value: "No songs are in queue at the moment"
        })
      }

      let embedded = new EmbedBuilder()
                          .setAuthor({ name: `${j} - ${q}`})
                          .setColor(6910463)
                          .addFields(fields)
                          .setFooter(footer)
                          .setThumbnail("https://i36.servimg.com/u/f36/20/47/49/21/jbday10.png")
        
      return embedded;
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
}

export default Message