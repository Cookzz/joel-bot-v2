import { SlashCommandBuilder } from "discord.js";

/* Play Music */
const playMusic = {
    ...new SlashCommandBuilder()
        .setName("play")
        .setDescription("play music")
        .addStringOption(option =>
            option.setName("text")
                    .setDescription("Search by name or add by URL")
                    .setRequired(true)
        )
}

const skipMusic = {
    ...new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skip music")
}

const COMMANDS = [
    playMusic,
    skipMusic
]

export default COMMANDS;