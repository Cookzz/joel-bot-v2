import { SlashCommandBuilder } from "discord.js";

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

const nowPlaying = {
    ...new SlashCommandBuilder()
        .setName("np")
        .setDescription("Get details of currently playing music")
}

const getQueue = {
    ...new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get list of queued songs")
}

//TODO: see if its possible to simplify and not repeat SlashCommandBuilder()

const COMMANDS = [
    playMusic,
    skipMusic,
    pauseMusic,
    resumeMusic,
    nowPlaying,
    getQueue
]

export default COMMANDS;