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
    let content = message.content.split(',')
    let msg = content[1].split(' ')

    if (content[0] == prefix){
        if(message.author.id!="434785369477742592"){
            if (msg[0] == "play"){
                if (songList.length==0){
                    songList.push(msg[1])
                    userVoiceChannel.join().then(connection => {
                        console.log("joined channel");
                        play(userVoiceChannel, connection, msg[1])
                    })
                } else {
                    songList.push(msg[1])
                }
            }

            if (msg[0] == "skip"){
                if (songList.length > 0){
                    skip(userVoiceChannel, connection)
                } else {
                    message.reply("There's no more song to skip.")
                }
            }
            //message.reply("working")
        }
    } else {
        message.reply("Invalid command")
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

async function skip(userVoiceChannel, connection) {
    songList.shift()
    console.log(songList[0])
    play(userVoiceChannel, connection, songList[0])
}
// Log our bot in
client.login(token);
