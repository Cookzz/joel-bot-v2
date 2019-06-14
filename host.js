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
  		p:(u,m)=>this.addMusic(u,m),
  		s:(u,m)=>this.skip(u,m),
  		se:(u,m)=>this.seek(u,m),
  		pa: (u,m)=>this.pause(u,m),
  		re: (u,m)=>this.resume(u,m),
  		l: (u,m)=>this.leave(u,m),
  		loop: (u,m)=>this.loop(u,m),
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
  	if(this.command.hasOwnProperty(m[0])){
  		this.command[m[0]](u,m);
  	}else{
  		u.reply("unknown command")
  	}
  }

  addMusic(u,m){
  	let voice=u.member.voiceChannel
  	if(m.length>1){
  		if (this.songList.length==0){
  			voice.join().then(connection => {
  				console.log("joined channel");
  				this.play(voice, connection, {
            url:m[1],
            option:{}
          })
  			})
  		}
  		this.songList.push({
        url:m[1],
        option:{}
      })
  		this.allSongList.push({
        url:m[1],
        option:{}
      })

  		ytdlCore.getInfo(m[1]).then((info) => {
  			u.channel.send("TITLE: " + info.title)
  			u.channel.send("Requested by: " + u.member.displayName)
  		});
  	}else{
  		u.reply("missing link")
  	}
  }

  loop(u,m){
    this.willLoop = !this.willLoop
  	u.channel.send('Loop '+(willLoop?'enabled':'disabled'));
  }

  skip(u,m) {
      if (this.songList.length > 0){
       	this.d.end();
      } else {
        u.reply("There's no more song to skip.")
      }
  }

  leave(u,m) {
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

  pause(u,m){
  	if (this.songList.length > 0){
  		this.d.pause();
  		u.channel.send('Paused.')
     } else {
  		u.reply("There's no song playing.")
     }
  }

  resume(u,m){
  	 if (this.songList.length > 0){
      	this.d.resume();
      	u.channel.send('Resumed.')
     } else {
    	  u.reply("There's no song playing.")
     }
  }

  seek(u,m){
  	let voice=u.member.voiceChannel
  	let time = 0;
  	if (m[1]){
  		  time = m[1]
  	}

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

}

module.exports=Host
