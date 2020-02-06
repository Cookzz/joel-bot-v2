const ytdlCore = require('ytdl-core');
const Message = require('./message.js');
const Socket = require('./socket.js');
const ytpl = require('ytpl');
const { YOUTUBE_API_KEY } = require('./constants');
const ytplSummary = require('youtube-playlist-summary')
const searchYoutube = require('youtube-api-v3-search');
const fs = require('fs')
const config = {
  GOOGLE_API_KEY: YOUTUBE_API_KEY, // require
  PLAYLIST_ITEM_KEY: ['videoUrl'], // option
}
const ps = new ytplSummary(config);

class Host{
  constructor(client) {
    this.prefix=","
    this.client=client
    this.songList = [];
    this.allSongList = [];
    this.quoteList = [
      "Why lah bro",
      "ER Diagram is my life",
      "Love, Joel Mathew",
      "Hi. I am Joel.",
      "Invaded by ERDark spirit Joel Mathew"
    ];
    this.currentSong;
    this.willLoop = false;
    this.connected;
    this.d;
    this.currentVoiceChannel="";
    this.currentChannel="";
    this.command={
  		p : (u,m,e)=>this.addMusic(u,m,e),
  		mv: (u,m,e)=>this.move(u,m,e),
  		rm: (u,m,e)=>this.remove(u,m,e),
  		s : (u,m,e)=>this.skip(u,m,e),
  		se: (u,m,e)=>this.seek(u,m,e),
  		pa: (u,m,e)=>this.pause(u,m,e),
  		re: (u,m,e)=>this.resume(u,m,e),
      l : (u,m,e)=>this.leave(u,m,e),
      dt: (u,m,e)=>this.checkSong(u,m,e),
      q : (u,m,e)=>this.getQueue(u,m,e),
  		loop: (u,m,e)=>this.loop(u,m,e),
      idof: (u,m,e)=>this.setId(u,m,e),
      addq: (u,m,e)=>this.addQuote(u,m,e)
    }

    //this.socket = require('socket.io-client')('http://128.199.116.158:8484');
    //this.socket = require('socket.io-client')('http://localhost:8484');
    this.socket = new Socket(this)
    this.socketConnection=false;
  }

  initSocket(){
    
  }

  onMessage(message){
    let userVoiceChannel = message.member.voiceChannel
    let content = message.content.substr(1)
    let msg = content.split(' ')

    if (message.content[0] == this.prefix){
        if(message.author.id!="434785369477742592"){
             this.sendCommand(message, msg)
        }
    }
  }

  sendCommand(u,m){
    let newParam=[]
    let newExtra=[]
    for(let i = 0;i<m.length;i++){
      if(m[i][0]=="-"){
        newExtra.push(m[i].substr(1))
      }else{
        newParam.push(m[i])
      }
    }

    console.log(newParam[0])
  	if(this.command.hasOwnProperty(newParam[0])){
  		this.command[newParam[0]](u,newParam,newExtra)
    }
    else{
  		u.reply("unknown command")
  	}
  }

  addQuote(u,m,e){
    if(m[1]){
      this.quoteList.push(m[1]);
    }
  }

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

  addMusic(u,m,e){
    let self = this
    let isLocal=this.detectExtra("local",e)
  	let voice=(this.currentVoiceChannel=="")?u.member.voice.channel.id:this.currentVoiceID
    this.currentVoiceID = voice

  	if(m.length>1){

      if(isLocal){
        
        this.socket.toClient({
          cmd:"find_local",
          client:u.member.id,
          channel:u.channel.id,
          guild:u.guild.id,
          voice:voice,
          path:m[1]
        })
      }else{
        if (m[1].includes("www.youtube.com")){
          if (m[1].includes("list=")){
            let id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec(m[1])

            ps.getPlaylistItems(id[1]).then((playlist)=>{
              playlist.items.forEach(({videoUrl})=>{
                ytdlCore.getInfo(videoUrl).then((info) => {
                  let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
                  let sec = info.length_seconds
                  let minutes = Math.floor((sec/ 60)) + ""
                  let seconds = Math.floor((sec % 60)) + ""
        
                  self.addSongToList({
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
                    guild :u.guild.id ,
                    voice:voice,
                  })
                })
              })
            }, (err)=>{
              console.log(err)

              //fallback (incase youtube api fails)
              ytpl(m[1], (err, playlist)=>{
                if (err){
                  u.channel.send("No playlist found")
                  return false;
                }

                playlist.items.forEach(({url_simple, title, thumbnail, duration, author})=>{
                  self.addSongToList({
                    url:url_simple,
                    option:{},
                    type:"youtube",
                    details:{
                      title: title,
                      author: author.name,
                      thumbnail_url: thumbnail,
                      duration: duration
                    },
                    member:u.member.displayName,
                    channel:u.channel,
                    guild:u.guild.id,
                    voice:voice,
                  })
                })
              })
            })

          } else {

            ytdlCore.getInfo(m[1]).then((info) => {
              let no = (info.player_response.videoDetails.thumbnail.thumbnails.length)-1
              let sec = info.length_seconds
              let minutes = Math.floor((sec/ 60)) + ""
              let seconds = Math.floor((sec % 60)) + ""
    
              u.channel.send("**Added:** " + info.title +
              (
                (this.songList.length!=0)?
                ( " to position "+(this.songList.length)):"")
              )
    
              this.addSongToList({
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
                guild:u.guild.id,
                voice:voice,
              })
            })

          }
        } else {
          // assuming that user wants to search if no youtube url exists
          m.shift()
          let query = m.join(' ')

          let options = {
            q: query,
            part:'snippet',
            type:'video',
            maxResults: 1
          }

          u.channel.send("Searching for the video...").then((msg)=>{
            searchYoutube(YOUTUBE_API_KEY, options).then((res)=>{
              msg.delete(1000);

              res.items.forEach(({ id, snippet })=>{
                const { channelTitle, thumbnails, title } = snippet
                u.channel.send("**Added:** " + title +
                (
                  (self.songList.length!=0)?
                  ( " to position "+(self.songList.length)):"")
                )

                self.addSongToList({
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
                  voice:voice,
                })
              })
            }, (err)=>{
              u.channel.send('Could not find the requested video.')
            })
          })
        }
      }

  	}else{
  		u.reply("missing parameter")
    }
  }

  addSongToList(songDetail){

    this.songList.push(songDetail)
    this.allSongList.push(songDetail)
    if(this.songList.length==1){
      this.play()
    }

  }

  loop(u,m,e){
    this.willLoop = !this.willLoop
  	u.channel.send('Loop '+(this.willLoop?'enabled':'disabled'));
  }

  skip(u,m,e) {
      if (this.songList.length > 0){
        if(this.songList[0].type=="local"){
          this.socket.toClient({cmd:'skip', client:this.songList[0].member})
        }else{
          this.d.end();
        }
      } else {
        u.reply("There's no more song to skip.")
      }
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
  	let voice=u.member.voiceChannel
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

    //play(voice, client.voiceConnections.find("guild id"), this.currentSong)
  }

  checkSong(u,m,e){
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
              embed = Message.getSongInfo(this.client,this.songList[no],this.quoteList)
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

  getQueue(u,m,e){
    let p = 0

    if (m[1]){
      let page = parseInt(m[1])

      if (page > 0){
        p = (page-1)
      }
    }

    let embed = Message.queueList(this.client,this.songList,p,this.quoteList)

    u.channel.send(embed)
  }

  play() {
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
          client:this.songList[0].member,
          cmd:'play_local_song'
        })
      }
    }
  }


  songEnd(){

    let type = this.songList[0].type
    let member = this.songList[0].member
    
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
              client:member,
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

  j2j(j){
    return JSON.parse(JSON.stringify(j));
  }
  detectExtra(s,a){
    for(let i=0;i<a.length;i++){
      if(s==a[i]){
        return true;
      }
    }

    return false;
  }
  getId(u,m,e){
    if(this.detectExtra("g",e)){
      u.reply("Guild ID: "+u.guild.id)
    }

    if(this.detectExtra("u",e)){
      u.reply("Your ID: "+u.member.id)
    }
  }
  setId(u,m,e){
    this.socket.emit("update_details",{
      u: u
    })
  }
}



module.exports=Host
