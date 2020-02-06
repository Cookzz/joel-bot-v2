const Discord = require('discord.js');
const ytdlCore = require('ytdl-core');

const client = new Discord.Client();
const { token } = require('./constants');
let fs = require("fs");
let client_detail = JSON.parse(fs.readFileSync("client_detail.json"));
//let socket = require('socket.io-client')('http://128.199.116.158:8484');
let socket = require('socket.io-client')('http://localhost:8484');

client.login(token)

client.on('ready', () => {
    console.log('client is ready')
});

client.on("error", () => {
    console.log("client error!")
});

socket.on("connect",()=>{
  console.log("yes")
  socket.emit("add_client",client_detail)
})

socket.on("find_local",(data)=>{
  socket.emit("local_song_detail",{
    status:"success",
    detail:{
      url:data.path,
      option:{},
      type:"local",
      title:data.path,
      member:client_detail.member,
      channel:data.channel,
      voice:data.voice,
    }
  });
})
let d;
socket.on("play_local_song",(data)=>{
  console.log("hen")
  console.log(data.voice)

  client.channels.get(data.voice).join().then(connection=>{
    console.log(data.url);
    d=connection.play("song/"+data.url, data.option)
  }).catch(e => {
    console.error(e);
  });

})

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
