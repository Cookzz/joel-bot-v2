const Discord = require('discord.js')

const client = new Discord.Client()

const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';

let songList = []
let d;
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
    let content = message.content

    if(message.author.id!="434785369477742592"){
        if (songList.length==0){
            songList.push(content)
            userVoiceChannel.join().then(connection => {
                console.log("joined channel");
                play(userVoiceChannel, connection, content)
            })
        } else {
            songList.push(content)
        }

        //message.reply("working")
    }
});

async function play(userVoiceChannel, connection, url) {
    d=connection.playOpusStream(await ytdl(url))
    songList.shift()
    d.on("end",end=>{
        if (songList.length > 0){
            console.log(songList[0])
            play(userVoiceChannel, connection, songList[0])
        } else {
            userVoiceChannel.leave()
        }
    })
}
// Log our bot in
client.login(token);
