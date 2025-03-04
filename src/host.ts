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
            play: (int: any, text: any) => this.addMusic(int, text),
            // mv: (u,m,e)=>this.player.move(u,m,e),
            // rm: (u,m,e)=>this.player.remove(u,m,e),
            skip : (int: any, text?: any) => this.player.skip(int),
            // se: (u,m,e)=>this.player.seek(u,m,e),
            pause: (int: any, text?: any) => this.player.pause(int),
            resume: (int: any, text?: any) => this.player.resume(int),
            // l : (u,m,e)=>this.player.leave(u,m,e),
            // np: (u,m,e)=>this.player.checkSong(u,m,e, this.quoteList),
            // q : (u,m,e)=>this.player.getQueue(u,m,e, this.quoteList),
            //     loop: (u,m,e)=>this.player.loop(u,m,e),
            // idof: (u,m,e)=>this.getId(u,m,e),
            // addq: (u,m,e)=>this.addQuote(u,m,e)
        }
    }

    async onCommand(interaction: ChatInputCommandInteraction<CacheType>, command: string) {
        // console.log("get interaction", interaction.member)
        // console.log("get command", command)

        const text = interaction.options.getString('text');
        
        await this.commands[command](interaction, text)
    }

    async addMusic(int: ChatInputCommandInteraction<CacheType>, text: string){
        const voice = getVoiceChannel(int)
        if (this.currentVoiceID){
            if (this.currentVoiceID !== voice){
                int.ephemeral = true
                int.reply("Not in the same voice channel as the bot")
            }
        }

        if (!voice) {
            int.reply("fuck you bitch ah, not in channel also want pick song, cause so many bug")
            return
        }
        if (!text){
            int.reply("No input is provided")
            return
        }

        this.player.setVoiceId(voice)
        this.currentVoiceID = voice
        await this.player.add(int, text)
    }
}

export default Host