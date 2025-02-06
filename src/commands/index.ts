import { SlashCommandBuilder } from "discord.js";

/* Play Music */
const playMusic = {
    ...new SlashCommandBuilder()
        .setName("play")
        .setDescription("play music")
        .addStringOption(option =>
            option.setName("url")
                    .setDescription("youtube url")
                    .setRequired(true)
        )
}

const COMMANDS = [
    playMusic
]

export default COMMANDS;