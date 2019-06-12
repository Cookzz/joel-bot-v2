const Discord = require('discord.js')

const client = new Discord.Client()

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE'

let songList = []

const ytdl = require('ytdl-core-discord')

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
    client.login(token)
});

client.on('message', async message => {
    var sender = message.member.user.tag;
    var userVoiceChannel = message.member.voiceChannel;

    if (sender != "Joel#0900"){
        userVoiceChannel.join().then(connection => {
            console.log("joined channel");
        });
    }
});

// Log our bot in
client.login(token);
