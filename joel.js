const Discord = require('discord.js')

const client = new Discord.Client()

<<<<<<< HEAD
// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE'
=======
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
>>>>>>> f66fe301864ffc66863dfc94cb6a378f46cee548

let songList = []

<<<<<<< HEAD
const ytdl = require('ytdl-core-discord')
=======
const ytdl = require('ytdl-core')
client.login(token)
>>>>>>> f66fe301864ffc66863dfc94cb6a378f46cee548

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
<<<<<<< HEAD
    client.login(token)
=======
>>>>>>> f66fe301864ffc66863dfc94cb6a378f46cee548
});

client.on('message', async message => {
<<<<<<< HEAD
    var sender = message.member.user.tag;
    var userVoiceChannel = message.member.voiceChannel;

    if (sender != "Joel#0900"){
        userVoiceChannel.join().then(connection => {
            console.log("joined channel");
        });
    }
=======
  if(message.author.id!="434785369477742592"){
    message.reply("working")
  }
>>>>>>> f66fe301864ffc66863dfc94cb6a378f46cee548
});

// Log our bot in
client.login(token);
