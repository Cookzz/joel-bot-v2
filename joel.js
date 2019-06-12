// Import the discord.js module
const Discord = require('discord.js')

// Create an instance of a Discord client
const client = new Discord.Client()

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE'

const PREFIX = "-"
const songList = []

const ytdl = require('ytdl-core-discord')

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
    client.login(token)
});

// Create an event listener for messages
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
