import { ChatInputCommandInteraction, Client, type CacheType, type Interaction } from 'discord.js';
import Player from './player';
import { getVoiceChannel } from './utils/host.util';
import type { Commands } from './types/command.type';

class Host {
    private readonly client: Client
    private readonly player: Player
    private readonly commands: Commands 
    private currentVoiceID: string | null

    constructor(client: Client) {
        this.client = client
        this.player = new Player(client)
        this.currentVoiceID = null

        this.commands = {
            play: (int: any, url: string) => this.addMusic(int, url),
            // mv: (u,m,e)=>this.player.move(u,m,e),
            // rm: (u,m,e)=>this.player.remove(u,m,e),
            // skip : (int: any, url: string) => this.player.skip(int),
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

    async addMusic(int: ChatInputCommandInteraction<CacheType>, url: string){
        const voice = getVoiceChannel(int)
        console.log('get voice', voice)
        if (this.currentVoiceID){
            if (this.currentVoiceID !== voice){
                int.ephemeral = true
                int.reply("Not in the same voice channel as the bot")
            }
        }

        if (voice) {
            this.player.setVoiceId(voice)
            this.currentVoiceID = voice

            if (url){
                await this.player.add(int, url)
            }
      
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