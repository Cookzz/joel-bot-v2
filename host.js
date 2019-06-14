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
  	}
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
    let songDetail={
      url:m[1],
      option:{},
      type:(isLocal)?"local":"youtube"
    }
  	if(m.length>1){
  		if (this.songList.length==0){
  			voice.join().then(connection => {
  				console.log("joined channel");
  				this.play(voice, connection,songDetail)
  			})
  		}
  		this.songList.push(songDetail)
  		this.allSongList.push(songDetail})

      //get song details
  		ytdlCore.getInfo(m[1]).then((info) => {
  			u.channel.send("TITLE: " + info.title)
  			u.channel.send("Requested by: " + u.member.displayName)
  		});
  	}else{
  		u.reply("missing link")
  	}
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
    const stream = ytdlCore(song.url, { filter : 'audioonly' });
  	this.d=connection.playStream(stream, song.option)

    this.currentSong = song.url

    this.d.on("end",end=>{
      this.songList.shift()
      if (this.songList.length > 0){
          console.log(this.songList[0])
          this.play(userVoiceChannel, connection, this.songList[0])
      } else {
    			if (this.willLoop){
    				this.songList = this.j2j(this.allSongList);
    				this.play(userVoiceChannel, connection, this.songList[0])
    			} else {
    				this.allSongList = [];
    				userVoiceChannel.leave()
  			}
      }
    })
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

}

module.exports=Host
