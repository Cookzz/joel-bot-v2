import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import { TOKEN, CLIENT_ID } from './config.json'
import COMMANDS from './src/commands'
import Host from './src/host';
import YTDlpWrap from 'yt-dlp-wrap';
import { platform } from 'os';
import { readdirSync, unlinkSync, existsSync } from 'node:fs'

const rest = new REST({ version: '10' }).setToken(TOKEN);

const cmd = COMMANDS

/* Download the required yt-dlp binary depending on the platform from github */
try {
  console.log("Started downloading yt-dlp binary.")

  const binaryPath = `./binaries/yt-dlp${platform() === 'win32' ? '.exe' : ''}`
  const hasBinary = existsSync(binaryPath)

  if (!hasBinary) {
    await YTDlpWrap.downloadFromGithub(
      binaryPath, //Platform dependent
      undefined,
      platform()
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