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
    let botVoiceConnection = message.guild.voiceConnection
    let content = message.content

    if(message.author.id!="434785369477742592"){
        if (!botVoiceConnection){
            userVoiceChannel.join().then(connection => {
                console.log("joined channel");
                play(connection, content)
            });
        } else {
            songList.push(content)
        }

        message.reply("working")
    }
});

async function play(connection, url) {
    let d=connection.playOpusStream(await ytdl(url))
    d.on("end",end=>{
        let hasSong = (songList.length > 0)

        if (hasSong){
            play(connection, songList[0])
        } else {
            userVoiceChannel.leave()
        }
    })
}
// Log our bot in
client.login(token);
