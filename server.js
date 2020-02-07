let app = require('http').createServer(handler)
let io = require('socket.io')(app);

let clientList={};
let host={};
app.listen(8484);

io.on('connection', function (socket) {
  socket.on("host",(data)=>{
    host={
      id:socket.id,
      socket:socket
    }
  })

  socket.on('client',(data)=>{
    clientList[data.member]={
      guild:data.guild,
      id:socket.id,
      socket:socket
    }
  })

  socket.on('disconnect',()=>{
    for(client in clientList){
      if(clientList[client].id==socket.id){
        delete clientList[client]
        break
      }
    }
  })

  socket.on('to_host',data => host.socket.emit('action', data))

  socket.on('to_client', data=>{
    if(clientList.hasOwnProperty(data.client)){
      clientList[data.client].socket.emit('action',data)
    }else{
      host.socket.emit('action', {cmd:'not_found'})
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
