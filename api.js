const express = require('express')
const app = express()
const port = 8000

app.get('/',async (req,res)=>{
    let result = await Promise.all(
        playlist.items.map(async ({videoUrl}, i)=>{
            let info = await ytdlCore.getInfo(videoUrl)
            let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
            let sec = info.length_seconds
            let minutes = Math.floor((sec/ 60)) + ""
            let seconds = Math.floor((sec % 60)) + ""
        
            // let details = {
            //     url:videoUrl,
            //     option:{},
            //     type:"youtube",
            //     details:{
            //         title: info.title,
            //         author: info.player_response.videoDetails.author,
            //         thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
            //         duration: minutes + ":" + seconds
            //     },
            //     member:u.member.displayName,
            //     channel:u.channel,
            //     voice:this.currentVoiceID,
            // }
            if(i!==0){
              allDetails[i-1].details = {
                ...allDetails[i-1].details,
                author: info.player_response.videoDetails.author,
                thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
                duration: minutes + ":" + seconds
              }
            }
            
            return {
                info,
                no,
                sec,
                minutes,
                seconds
            }
        })
    )
})