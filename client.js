const Discord = require('discord.js');
const ytdlCore = require('ytdl-core');

const client = new Discord.Client();
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
let fs = require("fs");
let client_detail = JSON.parse(fs.readFileSync("client_detail.json"));
let socket = require('socket.io-client')('http://128.199.116.158:8484');
//let socket = require('socket.io-client')('http://localhost:8484');

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
    d=connection.playFile("./song/"+data.url, data.option)
  }).catch(e => {
    console.error(e);
  });

})

socket.on("disconnect",()=>{
})
