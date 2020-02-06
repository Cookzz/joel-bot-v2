const Discord = require('discord.js');

const client = new Discord.Client();
const { token } = require('./constants');
let fs = require("fs");
let client_detail = JSON.parse(fs.readFileSync("client_detail.json"));
//let socket = require('socket.io-client')('http://128.199.116.158:8484');
let socket = require('socket.io-client')('http://localhost:8484');


let songStream;
let currentVoiceChannel;
const find_local = data => {
  console.log('hi')
  toHost({
    cmd:'add_local',
    status:"success",
    detail:{
      url:data.path,
      option:{},
      type:"local",
      title:data.path,
      member:client_detail.member,
      channel:data.channel,
      guild:data.guild,
      voice:data.voice,
    }
  });
}

const play_local_song = data => {
  currentVoiceChannel = client.channels.get(data.voice)
  //console.log(currentVoiceChannel);
  
  currentVoiceChannel.join().then(connection=>{
    console.log(data.url);
    songStream=connection.play("song/"+data.url, data.option)
    songStream.on('end',end=>{
      toHost({
        cmd:'local_song_end',
        status:"success",
      })
    })
  }).catch(e => {
    console.error(e);
  });
}

const skip = data =>{
  songStream.end()
}

const leave_channel = data => {
  currentVoiceChannel.leave()
  currentVoiceChannel =''
}


const actions = {
  find_local,
  play_local_song,
  skip,
  leave_channel
}

client.login(token)

client.on('ready', () => {
    console.log('client is ready')
});

client.on("error", () => {
    console.log("client error!")
});

socket.on("connect",()=>{
  console.log("yes")
  socket.emit("client",client_detail)
})

socket.on('action',data => {
  console.log(data.cmd)
  actions[data.cmd](data)
})

const toHost = data => {
  socket.emit("to_host",data);
}

socket.on("update_client", (data)=>{
  let u = data.u
  console.log(data)
  let guild = u.guild.id
  let member = u.member.id

  let json = {
    "guild": guild,
    "member": member
  }
  fs.writeFileSync('./client_detail.json', JSON.stringify(json))
})

socket.on("disconnect",()=>{
})
