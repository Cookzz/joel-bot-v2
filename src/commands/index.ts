import { SlashCommandBuilder } from "discord.js";

/* Play Music */
const playMusic = {
    ...new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play music via searching or youtube url")
        .addStringOption(option =>
            option.setName("text")
                    .setDescription("Search by name or add by URL")
                    .setRequired(true)
        )
}

const skipMusic = {
    ...new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip music")
}

const pauseMusic = {
    ...new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause currently playing music")
}

const resumeMusic = {
    ...new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume currently paused music")
}

const COMMANDS = [
    playMusic,
    skipMusic,
    pauseMusic,
    resumeMusic
]

export default COMMANDS;