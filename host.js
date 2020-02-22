const Socket = require('./socket.js');
const Player = require('./player.js');
const fs = require('fs')

class Host{
  constructor(client) {
    this.prefix=","
    this.client=client

    //this.socket = require('socket.io-client')('http://128.199.116.158:8484');
    //this.socket = require('socket.io-client')('http://localhost:8484');
    this.socket = new Socket(this)
    this.player = new Player(client)
    this.socketConnection=false;

    //need to move quotelist to Message.js soon
    this.quoteList = [
      "Why lah bro",
      "ER Diagram is my life",
      "Love, Joel Mathew",
      "Hi. I am Joel.",
      "Invaded by ERDark spirit Joel Mathew"
    ];

    this.command={
  		p : (u,m,e)=>this.addMusic(u,m,e),
  		mv: (u,m,e)=>this.player.move(u,m,e),
  		rm: (u,m,e)=>this.player.remove(u,m,e),
  		s : (u,m,e)=>this.player.skip(u,m,e),
  		se: (u,m,e)=>this.player.seek(u,m,e),
  		pa: (u,m,e)=>this.player.pause(u,m,e),
  		re: (u,m,e)=>this.player.resume(u,m,e),
      l : (u,m,e)=>this.player.leave(u,m,e),
      np: (u,m,e)=>this.player.checkSong(u,m,e, this.quoteList),
      q : (u,m,e)=>this.player.getQueue(u,m,e, this.quoteList),
  		loop: (u,m,e)=>this.player.loop(u,m,e),
      idof: (u,m,e)=>this.getId(u,m,e),
      addq: (u,m,e)=>this.addQuote(u,m,e)
    }
  }

  initSocket(){
    
  }

  onMessage(message){
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

  addMusic(u,m,e){
    let isLocal=this.detectExtra("local",e)
  	let voice=u.member.voice.channel.id
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
        this.player.add(u,m,e)
      }

  	}else{
  		u.reply("missing parameter")
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
