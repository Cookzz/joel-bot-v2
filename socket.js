class Socket{
    constructor(host){
        this.player = host
        this.socket = require('socket.io-client')('http://167.99.64.187:8484');

        this.action = {
            add_local:this.addLocal,
            play_local_result:this.playLocalSongResult,
            not_found:this.notFound,
            local_song_end:this.localSongEnd
        }

        this.socket.on("connect",()=>{
            this.player.socketConnection=true;
            this.socket.emit("host",{})
        })
        
        this.socket.on('action' , data => {
            console.log(data.cmd);
            this.action[data.cmd](data)
        })
    }

    toClient(data){
        this.socket.emit('to_client',data)
    }

    playLocalSongResult = data => {
        if(data.status=="success"){
            this.player.client.channels.get(data.channel).send("playing local");
        }
    }

    notFound = data => {

    }

    addLocal = data => {
        if(data.status=="fail"){
            this.player.client.channels.get(data.channel).send("Add local fail! code: "+data.code);
        }else{
            // data.connection=this.client.voiceConnections.get("371828027388329984")
            // console.log(data.connection);
            this.player.songList.push(data.detail)
            this.player.play()
            console.log(this.player.songList)
        }
    }

    localSongEnd = data => {
       
        this.player.songEnd()
    }
}

module.exports=Socket
