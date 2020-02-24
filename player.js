const ytdlCore = require('ytdl-core');
const ytpl = require('ytpl');
const ytplSummary = require('youtube-playlist-summary')
const searchYoutube = require('youtube-api-v3-search');

const { YOUTUBE_API_KEY } = require('./constants');
const Socket = require('./socket.js');
const Message = require('./message.js');
const fs = require('fs')

const config = {
  GOOGLE_API_KEY: YOUTUBE_API_KEY, // require
  PLAYLIST_ITEM_KEY: ['videoUrl','title'], // option
}
const ps = new ytplSummary(config);

class Player{

    constructor(client){
        this.client = client
        this.songList = [];
        this.allSongList = [];
        this.d;
        this.willLoop = false;
        this.currentSong;
        this.currentVoiceChannel = ""
        this.currentVoiceID = ""
        this.socket = new Socket(this)
        this.socketConnection=false;
    }

    async add(u,m,e){
        let isPlaylist = false;
        let list = null;

        let voice=(this.currentVoiceChannel=="")?u.member.voice.channel.id:this.currentVoiceID
        this.currentVoiceID = voice

        if (m[1].includes("www.youtube.com")){
            if (m[1].includes("list=")){
                list = await this.fromPlaylist(u,m,e)
                if (list.length > 0){
                    u.channel.send('Successfully added playlist')
                }
                isPlaylist = true;
            } else {
                list = await this.fromLink(u,m,e)
            }
        } else {
            list = await this.fromSearch(u,m,e)
        }

        this.toList(list, isPlaylist)
    }

    toList(list, isPlaylist){
        this.songList = this.songList.concat(list)
        this.allSongList = this.allSongList.concat(list)

        console.log("song list")
        //console.log(this.songList)

        if(this.songList.length==1 && !isPlaylist){
            this.play()
        }
    }

    play(){
        let embed = null;

        if(this.songList.length>0){
          if(this.songList[0].type=="youtube"){
            //console.log(this.songList[0]);
            this.currentVoiceChannel = this.client.channels.get(this.songList[0].voice)
            this.currentVoiceChannel.join().then(connection => {
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
    
              this.d.on("end",end=>this.songEnd())
            })
          }else if(this.songList[0].type=="local"){
            //console.log(this.songList[0])
            this.socket.toClient({
              ...this.songList[0],
              client:this.songList[0].member_id,
              cmd:'play_local_song'
            })
            
            embed = {
              fields: [
                {
                  name: 'Now Playing:',
                  value: this.songList[0].details.title
                }
              ]
            };
  
            this.client.channels.get(this.songList[0].channel).send({"embed":embed})
          }
        }
    }

    songEnd(){
        let type = this.songList[0].type
        let member_id = this.songList[0].member_id
        
        this.songList.shift()
        if (this.songList.length > 0){
            this.play()
            console.log('continue play');
            
        } else {
            console.log('no more song');
        
            if (this.willLoop){
                this.songList = this.j2j(this.allSongList);
                this.play()
            } else {
            //console.log(this.currentVoiceChannel);
              this.allSongList = [];

              if(type=='local'){
                  this.socket.toClient({
                      client:member_id,
                      cmd:'leave_channel'
                  })
              }else{
                  console.log('leaving here');

                  this.currentVoiceChannel.leave()            
                  this.currentVoiceChannel="";
              }

            }
        }
    }

    /*
    Keep first -- this has rather fast performance but not a very clean method 
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
    */

    /* WORKING -- but slow performance */
    async fromPlaylist(u,m,e){
        let id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec(m[1])
        try {

            let playlist = await ps.getPlaylistItems(id[1])
            let allDetails = playlist.items.map(({videoUrl,title})=>({
              url:videoUrl,
              option:{},
              type:"youtube",
              details:{
                  title: title,
                  
              },
              member:u.member.displayName,
              channel:u.channel,
              voice:this.currentVoiceID,
            }))
            this.songList.push(allDetails[0]);
            this.play();


            Promise.all(
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

                    allDetails[i].details = {
                      ...allDetails[i].details,
                      author: info.player_response.videoDetails.author,
                      thumbnail_url: info.player_response.videoDetails.thumbnail.thumbnails[no].url,
                      duration: minutes + ":" + seconds
                    }
                    // if (i == 0 && this.songList.length == 0){
                    //     this.songList.push(details);
                    //     this.play();
                    // } else {
                    //     return details
                    // }
                })
            )
            
            //allDetails.shift();

            return allDetails
        } catch (err){
            u.channel.send("No playlist found.")
            //fallback
            // ytpl(m[1], (err, playlist)=>{
            //     if (err){
            //         u.channel.send("No playlist found")
            //         throw err;
            //     }

            //     let finalList = await Promise.all(
            //         playlist.items.map(async ({url_simple, title, thumbnail, duration, author}, i)=>{
            //             let details = {
            //                 url:url_simple,
            //                 option:{},
            //                 type:"youtube",
            //                 details:{
            //                     title: title,
            //                     author: author.name,
            //                     thumbnail_url: thumbnail,
            //                     duration: duration
            //                 },
            //                 member:u.member.displayName,
            //                 channel:u.channel,
            //                 voice:this.currentVoiceId,
            //             }
    
            //             if (i == 0 && this.songList.length == 0){
            //                 this.songList.push(details);
            //                 this.play();
            //             } else {
            //                 return details
            //             }
            //         })
            //     )

            //     return finalList
            // })
        }
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
            voice:this.currentVoiceID,
          }]
        })
    }

    async fromSearch(u,m,e){
        // assuming that user wants to search if no youtube url exists
        m.shift()
        let query = m.join(' ')

        let options = {
            q: query,
            part:'snippet',
            type:'video',
            maxResults: 1
        }

        let msg = await u.channel.send("Searching for the video...")

        return searchYoutube(YOUTUBE_API_KEY, options).then((res)=>{
            msg.delete(1000);

            const {
                id,
                snippet
            } = res.items[0]

            const { channelTitle, thumbnails, title } = snippet

            u.channel.send("**Added:** " + title +
            (
                (this.songList.length!=0)?
                ( " to position "+(this.songList.length)):"")
            )

            return [{
                url: 'https://www.youtube.com/watch?v='+id.videoId,
                option:{},
                type:"youtube",
                details:{
                    title: title,
                    author: channelTitle,
                    thumbnail_url: thumbnails.default.url,
                    duration: '0:00'
                },
                member:u.member.displayName,
                channel:u.channel,
                guild:u.guild.id,
                voice:this.currentVoiceID,
            }]
        }, (err)=>{
            u.channel.send('Could not find the requested video.')
            throw err
        })
    }

    /** Player Actions **/
    remove(u,m,e){
      if(m.length<1){
        u.channel.send("missing parameter!")
      }else{
        if(parseInt(m[1])){
          let m1=parseInt(m[1])
          if((m1>0&&m1<(this.songList.length)))
          {
            u.channel.send("Removed: " + this.songList[m1].title)
            this.songList.splice(m1, 1);
          }
        }else{
          u.channel.send("parameter need to be number")
        }
      }
    }
    
    move(u,m,e){
      if(m.length<2){
        u.channel.send("missing parameter!")
      }else{
        if(parseInt(m[1])&&parseInt(m[2])){
          let m1=parseInt(m[1])
          let m2=parseInt(m[2])
          if(
            (m1>0&&m1<(this.songList.length))&&
            (m2>0&&m2<(this.songList.length))
          ){
            u.channel.send("Moved " + this.songList[m1].title + " to position " + m2)
  
            if (m2 >= this.songList.length) {
              var k = m2 - this.songList.length + 1
              while (k--) {
                this.songList.push(undefined)
              }
            }
  
            this.songList.splice(m2, 0, this.songList.splice(m1, 1)[0])
  
            let allM1 = m1 + (this.allSongList.length - this.songList.length)
            let allM2 = m2 + (this.allSongList.length - this.songList.length)
  
            this.allSongList.splice(allM2, 0, this.songList.splice(allM1, 1)[0])
  
          }else{
            u.channel.send("index out of bound")
          }
        }else{
          u.channel.send("parameter need to be number")
        }
      }
    }

    skip(u,m,e){
        if (this.songList.length > 0){
            if(this.songList[0].type=="local"){
              this.socket.toClient({cmd:'skip', client:this.songList[0].member_id})
            }else{
              this.d.end();
            }
        } else {
            u.reply("There's no more song to skip.")
        }
    }

    loop(u,m,e){
        this.willLoop = !this.willLoop
        u.channel.send('Loop '+(this.willLoop?'enabled':'disabled'));
    }

    leave(u,m,e) {
        let voice=u.member.voice.channel
        let botConnection = u.guild.voice.connection

        if (botConnection){
            voice.leave()
            u.channel.send('Left voice channel.')
            this.songList = []
        } else {
            u.channel.send('I am not in a voice channel.')
        }
    }

    pause(u,m,e){
        if (this.songList.length > 0){
            this.d.pause();
            u.channel.send('Paused.')
        } else {
            u.reply("There's no song playing.")
        }
    }

    resume(u,m,e){
        if (this.songList.length > 0){
            this.d.resume();
            u.channel.send('Resumed.')
        } else {
            u.reply("There's no song playing.")
        }
    }

    seek(u,m,e){
        let time = 0;

        if (m[1]){
            time = m[1]
        }

        console.log("seek entered")

        this.songList.splice(1, 0, {
            url:this.currentSong,
            option:{
                seek: parseInt(time)
            }
        });

        this.d.end();
    }

    checkSong(u,m,e, quoteList){
      let no = 0
      let embed = null;
      let reg = new RegExp('^[0-9]*$')
  
      if (this.songList.length > 0){
          let songNo = parseInt(m[1])
  
          if (m[1]){
            if (songNo > 0){
              no = songNo
            }
          } 
  
          let isNumber = (m[1])?m[1]:0
  
          if (reg.test(isNumber)){
            if (songNo && songNo > this.songList.length){
              embed = "Song does not exist"
            } else {
              if (this.songList[no].type == "youtube"){
                embed = Message.getSongInfo(this.client,this.songList[no],quoteList)
              } else {
                embed = "Such feature is not available to local songs yet"
              }
            }
          } else {
            embed = "Parameter must be a number"
          }
          
          u.channel.send(embed)
      } else {
        u.channel.send("There are no songs available")
      }
    }
    
    getQueue(u,m,e, quoteList){
      let p = 0
  
      if (m[1]){
        let page = parseInt(m[1])
  
        if (page > 0){
          p = (page-1)
        }
      }
  
      let embed = Message.queueList(this.client,this.songList,p,quoteList)
  
      u.channel.send(embed)
    }

    /* Misc */
    j2j(j){
      return JSON.parse(JSON.stringify(j));
    }
}

module.exports=Player


class Song{
  constructor(title,link){
    //init...
    //run promise
    this.promise()
  }

  promise(){

  }
}