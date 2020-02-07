const ytdlCore = require('ytdl-core');
const { YOUTUBE_API_KEY } = require('./constants');
const ytplSummary = require('youtube-playlist-summary')
const config = {
  GOOGLE_API_KEY: YOUTUBE_API_KEY, // require
  PLAYLIST_ITEM_KEY: ['videoUrl'], // option
}
const ps = new ytplSummary(config);

class Player{

    constructor(voice){
        this.songList = [];
        this.allSongList = [];
        this.currentSong;
        this.currentVoiceChannel=voice
    }

    async add(u,m,e){
        let isPlaylist = false;
        let list = null;
        if (m[1].includes("list=")){
            list = await this.fromPlaylist(u,m,e)
            if (list.length > 0){
                u.channel.send('Successfully added playlist')
            }
            isPlaylist = true;
        } else {
            list = await this.fromLink(u,m,e)
        }

        this.toList(list, isPlaylist)
    }

    toList(list, isPlaylist){
        this.songList = this.songList.concat(list)
        this.allSongList = this.allSongList.concat(list)

        console.log("song list")
        console.log(this.songList)

        if(this.songList.length==1 && !isPlaylist){
            this.play()
        }
    }

    play(){
        let embed = null;

        this.currentVoiceChannel.join().then(connection => {
            if(this.songList.length>0){
                if(this.songList[0].type=="youtube"){
                    const stream = ytdlCore(this.songList[0].url, { filter : 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 });
                    this.d=connection.play(stream, this.songList[0].option)
        
                    this.currentSong = this.songList[0].url
            
                    embed = {
                        fields: [
                            {
                                name: 'Now Playing:',
                                value: this.songList[0].details.title
                            }
                        ]
                    };
            
                    this.songList[0].channel.send({"embed":embed})
            
                    this.d.on("end",end=>{
                        this.songList.shift()
                        if (this.songList.length > 0){
                            this.play()
                        } else {
                            if (this.willLoop){
                                this.songList = this.j2j(this.allSongList);
                                this.play()
                            } else {
                                this.allSongList = [];
                                this.currentVoiceChannel.leave()
                                this.currentVoiceChannel="";
                            }
                        }
                    })
                } else if(this.songList[0].type=="local"){
                    //this.socket.emit("play_local",this.songList[0])
                }
            }
        })
    }

    // fromPlaylist(u,m,e){
    //     let id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec(m[1])
    //     let self = this

    //     ps.getPlaylistItems(id[1]).then((playlist)=>{
    //         playlist.items.forEach(({videoUrl})=>{
    //             ytdlCore.getInfo(videoUrl).then((info) => {
    //                 let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
    //                 let sec = info.length_seconds
    //                 let minutes = Math.floor((sec/ 60)) + ""
    //                 let seconds = Math.floor((sec % 60)) + ""
        
    //                 self.toList({
    //                     url:videoUrl,
    //                     option:{},
    //                     type:"youtube",
    //                     details:{
    //                         title: info.title,
    //                         author: info.player_response.videoDetails.author,
    //                         thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
    //                         duration: minutes + ":" + seconds
    //                     },
    //                     member:u.member.displayName,
    //                     channel:u.channel,
    //                     voice:this.currentVoiceChannel.id,
    //                 })
    //             })
    //         })
    //     }, (err)=>{
    //         console.log(err)

    //         //fallback (incase youtube api fails)
    //         ytpl(m[1], (err, playlist)=>{
    //             if (err){
    //                 u.channel.send("No playlist found")
    //                 return false;
    //             }

    //             playlist.items.forEach(({url_simple, title, thumbnail, duration, author})=>{
    //                 self.addSongToList({
    //                     url:url_simple,
    //                     option:{},
    //                     type:"youtube",
    //                     details:{
    //                         title: title,
    //                         author: author.name,
    //                         thumbnail_url: thumbnail,
    //                         duration: duration
    //                     },
    //                     member:u.member.displayName,
    //                     channel:u.channel,
    //                     voice:this.currentVoiceChannel.id,
    //                 })
    //             })
    //         })
    //     })
    // }

    /* WORKING -- but slow performance */
    async fromPlaylist(u,m,e){
        let id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec(m[1])
        let playlist = await ps.getPlaylistItems(id[1])

        let finalList = await Promise.all(
            playlist.items.map(async ({videoUrl}, i)=>{
                let info = await ytdlCore.getInfo(videoUrl)
                let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
                let sec = info.length_seconds
                let minutes = Math.floor((sec/ 60)) + ""
                let seconds = Math.floor((sec % 60)) + ""
            
                let details = {
                    url:videoUrl,
                    option:{},
                    type:"youtube",
                    details:{
                        title: info.title,
                        author: info.player_response.videoDetails.author,
                        thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
                        duration: minutes + ":" + seconds
                    },
                    member:u.member.displayName,
                    channel:u.channel,
                    voice:this.currentVoiceChannel.id,
                }

                if (i == 0 && this.songList.length == 0){
                    this.songList.push(details);
                    this.play();
                } else {
                    return details
                }
            })
         )

         return finalList

    /* IGNORE THE ONE BELOW HERE */
    //     , (err)=>{
    //       console.log(err)

    //       //fallback (incase youtube api fails)
    //       ytpl(m[1], (err, playlist)=>{
    //         if (err){
    //           u.channel.send("No playlist found")
    //           return false;
    //         }

    //         playlist.items.forEach(({url_simple, title, thumbnail, duration, author})=>{
    //           self.addSongToList({
    //             url:url_simple,
    //             option:{},
    //             type:"youtube",
    //             details:{
    //               title: title,
    //               author: author.name,
    //               thumbnail_url: thumbnail,
    //               duration: duration
    //             },
    //             member:u.member.displayName,
    //             channel:u.channel,
    //             voice:this.currentVoiceChannel.id,
    //           })
    //         })
    //       })
    //     })
    }

    fromLink(u,m,e){
        return ytdlCore.getInfo(m[1]).then((info) => {
            let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
            let sec = info.length_seconds
            let minutes = Math.floor((sec/ 60)) + ""
            let seconds = Math.floor((sec % 60)) + ""
  
            u.channel.send("**Added:** " + info.title +
            (
              (this.songList.length!=0)?
              ( " to position "+(this.songList.length)):"")
            )
  
            return [{
              url:m[1],
              option:{highWaterMark: 1},
              type:"youtube",
              details:{
                title: info.title,
                author: info.player_response.videoDetails.author,
                thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
                duration: minutes + ":" + seconds
              },
              member:u.member.displayName,
              channel:u.channel,
              voice:this.currentVoiceChannel.id,
            }]
          })
    }

    fromSearch(){

    }
}

module.exports=Player