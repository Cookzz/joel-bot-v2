const Discord = require('discord.js')

const client = new Discord.Client()

const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';

let songList = []

const ytdl = require('ytdl-core-discord')
client.login(token)

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
});

client.on('message', async message => {
    let userVoiceChannel = message.member.voiceChannel
    if(message.author.id!="434785369477742592"){
      userVoiceChannel.join().then(connection => {
          console.log("joined channel");
          play(userVoiceChannel,connection, "https://www.youtube.com/watch?v=_AZDaW3GLQw")
      });
      message.reply("working")
    }
});

async function play(userVoiceChannel,connection, url) {
  let d=connection.playOpusStream(await ytdl(url));
  d.on("end",end=>{
    userVoiceChannel.leave()
    //play(connection, "https://www.youtube.com/watch?v=_AZDaW3GLQw")
  })
}
// Log our bot in
client.login(token);
