let app = require('http').createServer(handler)
let io = require('socket.io')(app);

let clientList={};
let host={};
app.listen(3000);

io.on('connection', function (socket) {
  socket.on('local_song', function (data) {
    console.log(data);
  });

  socket.on("host",(data)=>{
    host={
      id:socket.id,
      socket:socket
    }
  })
  socket.on('add_client',(data)=>{
    clientList[data.member]={
      guild:data.guild,
      id:socket.id,
      socket:socket
    }
  })

  socket.on('client_add_music',(data)=>{
    if(clientList.hasOwnProperty(data.client)){
      clientList[data.client].socket.emit("find_local",{
        path:data.path,
        channel:data.channel,
      })
    }else{
      socket.emit("add_local",{
        status:"fail",
        channel:data.channel,
        code:1
      })
    }
  })

  socket.on("local_song_detail",(data)=>{
    if(data.status=="success"){
      host.socket.emit("add_local",{
        status:"success",
        detail:data.detail
      })
    }
  })


  socket.on("play_local",(data)=>{
    console.log("play_local")
    if(clientList.hasOwnProperty(data.member)){
      clientList[data.member].socket.emit("play_local_song",data)
    }else{
      socket.emit("play_local_result",{
        status:"fail",
        channel:data.channel,
        code:1
      })
    }
  })

  socket.on("play_local_client_finish",(data)=>{
    host.socket.emit("play_local_result",data)
  })

  socket.on('disconnect',()=>{
    for(client in clientList){
      if(clientList[client].id==socket.id){
        delete clientList[client]
        break
      }
    }
  })
});



function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
