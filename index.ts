import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import COMMANDS from './src/commands'
import Host from './src/host';
import { readdirSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
import { getYtdlpExecutableName } from './src/utils/config.util';

const YTDlpWrap = require('yt-dlp-wrap-plus').default;

const cmd = COMMANDS

/* Check if config.json file exists first, if not we will throw an error
Continue to import if it exists */
try {
  console.log("Checking config file")

  if (!existsSync('./config.json')){
      throw new Error("No config file found. Please check README and setup one yourself.")
  }
  console.log("Config file exists")
} catch (error) {
  console.error("Config file search error: ", error);
}

import { TOKEN, CLIENT_ID } from './config.json'
const rest = new REST({ version: '10' }).setToken(TOKEN);

/* Download the required yt-dlp binary depending on the platform from github */
try {
  console.log("Check for binary directory")

  if (!existsSync('./binaries')){
    console.log("Created directory for binary storage")
    mkdirSync('./binaries')
  }

  console.log("Started downloading yt-dlp binary.")

  const binaryPath = `./binaries/${getYtdlpExecutableName()}}`
  const hasBinary = existsSync(binaryPath)

  if (!hasBinary) {
    await YTDlpWrap.downloadFromGithub(
      binaryPath, //Platform dependent
      undefined
    );
  
    console.log("Finished downloading yt-dlp binary.")
  } else {
    console.log("Binary already exists")
  }
} catch (error) {
  console.error(error);
}

/* Auto-clear tmp files */
try {
  console.log("Clearing tmp files")

  if (!existsSync('./tmp')){
      mkdirSync('./tmp')
  }

  readdirSync('./tmp').forEach(file => unlinkSync(`./tmp/${file}`));

  console.log("Cleared tmp files")
} catch (error) {
  console.error(error);
}

/* Start registering slash commands */
try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: cmd });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildPresences, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ] 
});

const host = new Host(client)

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  host.onCommand(interaction, interaction.commandName)
});


client.login(TOKEN);