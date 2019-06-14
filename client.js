const Discord = require('discord.js');

const client = new Discord.Client();
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
let fs = require("fs");
let client_detail = JSON.parse(fs.readFileSync("client_detail.json"));
let socket = require('socket.io-client')('http://localhost:3000');

client.login(token)

client.on('ready', () => {
    console.log('client is ready')
});

client.on("error", () => {
    console.log("client error!")
});

socket.on("connect",()=>{
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
    }
  });
})

socket.on("play_local_song",(data)=>{
  console.log(client.voiceConnections)
  let connection=client.voiceConnections.get(client_detail.guild)
  // this.d=connection.playFile("song/"+data.path, data.option)
  // this.d.on("end",end=>{})
  // console.log("hi");
  // socket.emit("play_local_client_finish",{
  //   status:success,
  //   detail:data
  // })
})

socket.on("disconnect",()=>{
})
