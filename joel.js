const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const ytdlCore = require('ytdl-core');

const client = new Discord.Client();
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
const prefix = ","

let songList = [];
let allSongList = [];
let currentSong;
let option = {};
let willLoop = false;
let connected;
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
		s:(u,m)=>skip(u,m),
		//se:(u,m)=>seek(u,m),
		pa: (u,m)=>pause(u,m),
		re: (u,m)=>resume(u,m),
		l: (u,m)=>leave(u,m),
		loop: ()=>loop(),
	}

	if(command.hasOwnProperty(m[0])){
		command[m[0]](u,m);
	}else{
		u.reply("unknown command")
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
		allSongList.push(m[1])

		ytdlCore.getInfo(m[1]).then((info) => {
			u.channel.send("TITLE: " + info.title)
			u.channel.send("Requested by: " + u.member.displayName)
		});
	}else{
		u.reply("missing link")
	}
}

function loop(){
	if (willLoop){
		willLoop = false;
		u.channel.send('Loop disabled.')
	} else {
		willLoop = true;
		u.channel.send('Loop enabled.')
	}
}

function skip(u,m) {
    if (songList.length > 0){
     	d.end();
    } else {
      	u.reply("There's no more song to skip.")
    }
}

function leave(u,m) {
	let voice=u.member.voiceChannel
	let botConnection = u.guild.voiceConnection

	if (botConnection){
		voice.leave().then(()=>{
			u.channel.send('Left voice channel.')
	
			songList = []
			allSongList = []
		})
	} else {
		u.channel.send('I am not in a voice channel.')
	}
}

function pause(u,m){
	if (songList.length > 0){
		d.pause();
		u.channel.send('Paused.')
   } else {
		u.reply("There's no song playing.")
   }
}

function resume(u,m){
	if (songList.length > 0){
		d.resume();
		u.channel.send('Resumed.')
   } else {
		u.reply("There's no song playing.")
   }
}

// function seek(u,m){
// 	let voice=u.member.voiceChannel
// 	let time = 0;
// 	if (m[1]){
// 		time = m[1]
// 	}

// 	option = {
// 		seek: time
// 	}

// 	play(voice, connected, currentSong)
// }

async function play(userVoiceChannel, connection, url) {
	d=connection.playOpusStream(await ytdl(url))

	currentSong = url
	
    d.on("end",end=>{
        songList.shift()
        if (songList.length > 0){
            console.log(songList[0])
            play(userVoiceChannel, connection, songList[0])
        } else {
			if (willLoop){
				songList = allSongList;
				play(userVoiceChannel, connection, songList[0])
			} else {
				allSongList = [];
				userVoiceChannel.leave()
			}
        }
    })
}
// Log our bot in
client.login(token);
