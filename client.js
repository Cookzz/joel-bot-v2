const Discord = require('discord.js');

let client = new Discord.Client();
const { token } = require('./constants');
let fs = require("fs");
let client_detail = JSON.parse(fs.readFileSync("client_detail.json"));
//let socket = require('socket.io-client')('http://128.199.116.158:8484');
let socket = require('socket.io-client')('http://localhost:8484');
// let socket = require('socket.io-client')('http://167.99.64.187:8484');

client.login(token)
const find = require('find');

let requiredReLogin = true;
let songStream;
let currentVoiceChannel;

let actions = {
  find_local: data => {
    find.file("^.*\.(mp3|ogg|flac)$", __dirname, function(files) {
      console.log(files);
    })
    toHost({
      cmd:'add_local',
      status:"success",
      detail:{
        url:data.path,
        option:{},
        type:"local",
        details:{
          title:data.path,
        },
        member:data.member,
        member_id:client_detail.member,
        channel:data.channel,
        guild:data.guild,
        voice:data.voice,
      }
    });
  },
  
  play_local_song: data => {
    //TODO: change to more valid operation
    //shouldn't every time reconnect after play a song
    if(requiredReLogin){
      client = new Discord.Client();
      client.login(token)
      client.on('ready', () => {
        requiredReLogin = false
        toAll({
          client:client_detail.member,
          cmd:'need_relogin'
        })
        playLocal(data)
      });       
    }else{
      playLocal(data)
    }
    
  },

  need_relogin: data =>{
    requiredReLogin = true
    console.log('relogin...')
  },
  
  skip: data =>{
    songStream.end()
  },
  
  leave_channel: data => {
    currentVoiceChannel.leave()
    currentVoiceChannel =''
    conn = ''
  }
}



socket.on("connect",()=>{
  console.log("yes")
  socket.emit("client",client_detail)
})

socket.on('error',()=>{
  console.log('nono');
  
})

socket.on('action',data => {
  console.log(data.cmd)
  actions[data.cmd](data)
})

const toHost = data => {
  socket.emit("to_host",data);
}

const toAll = data => {
  socket.emit('to_all',data)
}

const playLocal = (data)=>{
  requiredReLogin = false;
  currentVoiceChannel = client.channels.get(data.voice)
  currentVoiceChannel.join().then(connection=>{

    songStream=connection.play("song/"+data.url, data.option)
    
    songStream.on('end',end=>{
      toHost({
        cmd:'local_song_end',
        status:"success",
      })
    })
  })
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
