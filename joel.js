const Discord = require('discord.js')
const ytdl = require('ytdl-core-discord')

const client = new Discord.Client()
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
const prefix = ","

let songList = []
let d;


client.login(token)

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
});

client.on('message', async message => {
    let userVoiceChannel = message.member.voiceChannel
    let content = message.content.substr(1)
    let msg = content.split(' ')

    if (message.content[0] == prefix){
        if(message.author.id!="434785369477742592"){
          command(message, msg)
            //message.reply("working")
        }
    }
});

function command(u,m){
  let command={
    p:(u,m)=>addMusic(u,m),
    s:(u,m)=>skip(u,m)
  }

  if(command.hasOwnProperty(m[0])){
    command[m[0]](u,m);
  }else{
    u.reply("unknow command")
  }

}

function addMusic(u,m){
  let voice=u.member.voiceChannel
  if(m.length>1){
    if (songList.length==0){
        voice.join().then(connection => {
            console.log("joined channel");
            play(voice, connection, m[1])
        })
    }
    songList.push(m[1])
  }else{
    u.reply("missing link")
  }
}

async function play(userVoiceChannel, connection, url) {
    d=connection.playOpusStream(await ytdl(url))
    d.on("end",end=>{
        songList.shift()
        if (songList.length > 0){
            console.log(songList[0])
            play(userVoiceChannel, connection, songList[0])
        } else {
            userVoiceChannel.leave()
        }
    })
}

function skip(u,m) {
    if (songList.length > 0){
      d.end();
    } else {
      u.reply("There's no more song to skip.")
    }
}
// Log our bot in
client.login(token);
