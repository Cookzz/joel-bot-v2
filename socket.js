class Socket{
    constructor(host){
        this.player = host
        // this.socket = require('socket.io-client')('http://167.99.64.187:8484');
        this.socket = require('socket.io-client')('http://localhost:8484');

        this.action = {
            add_local:this.addLocal,
            play_local_result:this.playLocalSongResult,
            not_found:this.notFound,
            local_song_end:this.localSongEnd,
            need_relogin:this.needReLogin,
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

    toAll(data){
        this.socket.emit('to_all',data)
    }

    playLocalSongResult = data => {
        if(data.status=="success"){
            this.player.client.channels.get(data.channel).send("playing local");
        }
    }

    needReLogin = data =>{
        this.player.requiredReLogin = true
        console.log('host re login...');
        
    }

    notFound = data => {

    }

    addLocal = data => {
        if(data.status=="fail"){
            this.player.client.channels.get(data.channel).send("Add local fail! code: "+data.code);
        }else{
            // data.connection=this.client.voiceConnections.get("371828027388329984")
            // console.log(data.connection);
            console.log(this.player.songList)

            this.player.songList.push(data.detail)
            if(this.player.songList.length==1){
                this.player.play()
            }
        }
    }

    localSongEnd = data => {
       
        this.player.songEnd()
    }
}

module.exports=Socket
