const Discord = require('discord.js')

const client = new Discord.Client()

const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';

let songList = []

const ytdl = require('ytdl-core')
client.login(token)

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
});

client.on('message', async message => {
  if(message.author.id!="434785369477742592"){
    message.reply("working")
  }
});
