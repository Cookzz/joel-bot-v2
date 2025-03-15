import { SlashCommandBuilder } from "discord.js";

const playMusic = {
    ...new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play music via searching or youtube url")
        .addStringOption(option =>
            option
                .setName("text")
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

const moveMusic = {
    ...new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a song from one slot to another")
        .addNumberOption(option => 
            option
                .setName("text")
                .setDescription("Song no. to move")
                .setRequired(true)
        )
        .addNumberOption(option => 
            option
                .setName("text2")
                .setDescription("Position to move to")
                .setRequired(true)
        )
}

const removeMusic = {
    ...new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove music from queue")
        .addStringOption(option => 
            option
                .setName("text")
                .setDescription("Song no. in queue")
                .setRequired(true)
        )
}

const loopList = {
    ...new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Loop currently queued songs")
}

const nowPlaying = {
    ...new SlashCommandBuilder()
        .setName("np")
        .setDescription("Get details of a song")
        .addStringOption(option => 
            option
                .setName("text")
                .setDescription("Song no. in queue or current song (if no number is used")
                .setRequired(false)
        )
}

const getQueue = {
    ...new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get list of queued songs")
        .addStringOption(option => 
            option
                .setName("text")
                .setDescription("Page no. (if any), get first page if not provided")
                .setRequired(false)
        )
}

const help = {
    ...new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all available commands")
}

//TODO: see if its possible to simplify and not repeat SlashCommandBuilder()

const COMMANDS = [
    playMusic,
    skipMusic,
    pauseMusic,
    resumeMusic,
    moveMusic,
    removeMusic,
    loopList,
    nowPlaying,
    help,
    getQueue
]

export default COMMANDS;