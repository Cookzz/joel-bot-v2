import { ChatInputCommandInteraction, Client, type CacheType, type Interaction } from 'discord.js';
import Player from './player';
import { getVoiceChannel } from './utils/host.util';
import type { Commands } from './types/command.type';

class Host {
    private readonly client: Client;
    private readonly player: Player
    private readonly commands: Commands 

    constructor(client: Client) {
        this.client = client
        this.player = new Player(client)
        this.commands = {
            play: (int: any, url: any) => this.addMusic(int, url)
            // mv: (u,m,e)=>this.player.move(u,m,e),
            // rm: (u,m,e)=>this.player.remove(u,m,e),
            // s : (u,m,e)=>this.player.skip(u,m,e),
            // se: (u,m,e)=>this.player.seek(u,m,e),
            // pa: (u,m,e)=>this.player.pause(u,m,e),
            // re: (u,m,e)=>this.player.resume(u,m,e),
            // l : (u,m,e)=>this.player.leave(u,m,e),
            // np: (u,m,e)=>this.player.checkSong(u,m,e, this.quoteList),
            // q : (u,m,e)=>this.player.getQueue(u,m,e, this.quoteList),
            //     loop: (u,m,e)=>this.player.loop(u,m,e),
            // idof: (u,m,e)=>this.getId(u,m,e),
            // addq: (u,m,e)=>this.addQuote(u,m,e)
        }
    }

    async onCommand(interaction: ChatInputCommandInteraction<CacheType>, command: string, url: string) {
        // console.log("get interaction", interaction.member)
        // console.log("get command", command)
        await this.commands[command](interaction, url)
    }

    async addMusic(int: any, url: string){
        const voice = getVoiceChannel(int)
        console.log('get voice', voice)
        if (voice) {
            this.player.setVoiceId(voice)

            if (url){
                await this.player.add(int, url)
            }
        //   this.currentVoiceID = voice
      
        //   if(m.length>1){
        //     // this.player.add(u,m,e)
        //   }else{
        //     int.reply("missing parameter")
        //   }
        } else {
            await int.reply("fuck you bitch ah, not in channel also want pick song, cause so many bug")
        }
    }
}

export default Host