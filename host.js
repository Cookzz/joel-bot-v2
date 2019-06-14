const ytdlCore = require('ytdl-core');

class Host{
  constructor(client) {
    this.prefix=","
    this.client=client
    this.songList = [];
    this.allSongList = [];
    this.currentSong;
    this.willLoop = false;
    this.connected;
    this.d;
    this.command={
  		p:(u,m,e)=>this.addMusic(u,m,e),
  		s:(u,m,e)=>this.skip(u,m,e),
  		se:(u,m,e)=>this.seek(u,m,e),
  		pa: (u,m,e)=>this.pause(u,m,e),
  		re: (u,m,e)=>this.resume(u,m,e),
  		l: (u,m,e)=>this.leave(u,m,e),
  		loop: (u,m,e)=>this.loop(u,m,e),
  		idof: (u,m,e)=>this.getId(u,m,e),
  	}

    this.socket = require('socket.io-client')('http://localhost:3000');
    this.socketConnection=false;
    this.initSocket()
  }
  initSocket(){
    this.socket.on("connect",()=>{
      this.socketConnection=true;
      this.socket.emit("host",{

      })
    })

    this.socket.on("add_local",(data)=>{
      if(data.status=="fail"){
        this.client.channels.get(data.channel).send("Add local fail! code: "+data.code);
      }else{
        // data.connection=this.client.voiceConnections.get("371828027388329984")
        // console.log(data.connection);
        this.addSongToList(data.detail)
      }
    })

    this.socket.on("play_local_result",(data)=>{
      if(data.status=="success"){
        this.client.channels.get(data.channel).send("playing local");
      }
    })
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
  	}else{
  		u.reply("unknown command")
  	}
  }

  addMusic(u,m,e){
    let isLocal=this.detectExtra("local",e)
  	let voice=u.member.voiceChannel

  	if(m.length>1){

      if(isLocal){
        this.socket.emit("client_add_music",{
          client:u.member.id,
          channel:u.channel.id,
          voice:voice.id,
          path:m[1]
        })
      }else{
        ytdlCore.getInfo(m[1]).then((info) => {
          this.addSongToList({
            url:m[1],
            option:{},
            type:"youtube",
            title:info.title,
            member:u.member.displayName,
            channel:u.channel.id
          },voice)
        })
      }

  	}else{
  		u.reply("missing parameter")
    }
  }

  addSongToList(songDetail,voice){
    if (this.songList.length==0){
      voice.join().then(connection => {
        console.log("joined channel");
        this.play(voice, connection,songDetail)
      })
    }
    this.songList.push(songDetail)
    this.allSongList.push(songDetail)

    // u.channel.send("TITLE: " + info.title)
    // u.channel.send("Requested by: " + u.member.displayName)
  }

  loop(u,m,e){
    this.willLoop = !this.willLoop
  	u.channel.send('Loop '+(willLoop?'enabled':'disabled'));
  }

  skip(u,m,e) {
      if (this.songList.length > 0){
       	this.d.end();
      } else {
        u.reply("There's no more song to skip.")
      }
  }

  leave(u,m,e) {
  	let voice=u.member.voiceChannel
  	let botConnection = u.guild.voiceConnection

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

  play(userVoiceChannel, connection, song) {

    if(song.type=="youtube"){
      const stream = ytdlCore(song.url, { filter : 'audioonly' });
    	this.d=connection.playStream(stream, song.option)

      this.currentSong = song.url

      this.d.on("end",end=>{
        this.songList.shift()
        if (this.songList.length > 0){
            //console.log(this.songList[0])
            this.play(userVoiceChannel, connection, this.songList[0])
            // u.channel.send("TITLE: " + this.songList.title)
            // u.channel.send("Requested by: " + this.songList.member)
        } else {
      			if (this.willLoop){
      				this.songList = this.j2j(this.allSongList);
      				this.play(userVoiceChannel, connection, this.songList[0])
              // u.channel.send("TITLE: " + this.songList.title)
              // u.channel.send("Requested by: " + this.songList.member)
      			} else {
      				this.allSongList = [];
      				userVoiceChannel.leave()
    			}
        }
      })
    }else if(song.type=="local"){
      this.socket.emit("play_local",song)
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
}

module.exports=Host
