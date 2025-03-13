import { ChatInputCommandInteraction, Client, type CacheType } from 'discord.js';
import Player from './player';
import { getVoiceChannel } from './utils/host.util';
import type { Commands } from './types/command.type';

class Host {
    private readonly client: Client
    private readonly player: Player
    private readonly commands: Commands 

    constructor(client: Client) {
        this.client = client
        this.player = new Player(client)

        this.commands = {
            play: (int: any, text: any) => this.addMusic(int, text),
            move: (int: any, text: any)=>this.player.move(int, text),
            remove: (int: any, text: any)=>this.player.remove(int, text),
            skip : (int: any, text?: any) => this.player.skip(int),
            // se: (u,m,e)=>this.player.seek(u,m,e),
            pause: (int: any, text?: any) => this.player.pause(int),
            resume: (int: any, text?: any) => this.player.resume(int),
            // l : (u,m,e)=>this.player.leave(u,m,e),
            np: (int: any, text: any)=>this.player.checkSong(int, text),
            queue : (int: any, text: any)=>this.player.getQueue(int, text),
            //     loop: (u,m,e)=>this.player.loop(u,m,e),
            // idof: (u,m,e)=>this.getId(u,m,e),
            // addq: (u,m,e)=>this.addQuote(u,m,e)
        }
    }

    /*
        we are using generic names like "text" in order to make value fetching universal among all the commands
        so if its a number, we also go through the hassle of validating via regex and parsing it into a number value
        it can be improved in the future by chaining ??, so get string -> get number -> null
    */
    async onCommand(interaction: ChatInputCommandInteraction<CacheType>, command: string) {
        let text = interaction.options.getString('text') ?? 
                   String(interaction.options.getNumber('number')) ?? '';
        let secondaryText = interaction.options.getString('text2') ?? 
                            String(interaction.options.getNumber('number2')) ?? null;

        //have "optional" secondary option, we try to not use more than 2 options
        if (secondaryText){
            text += `,${secondaryText}`
        }
        
        await this.commands[command](interaction, text)
    }

    async addMusic(int: ChatInputCommandInteraction<CacheType>, text: string){
        const voice = getVoiceChannel(int)
        const currentVoiceId = this.player.getVoiceId()
        if (currentVoiceId){
            if (currentVoiceId !== voice){
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
        await this.player.add(int, text)
    }
}

export default Host