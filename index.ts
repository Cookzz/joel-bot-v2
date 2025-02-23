import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import { TOKEN, CLIENT_ID } from './config.json'
import COMMANDS from './src/commands'
import Host from './src/host';
import YTDlpWrap from 'yt-dlp-wrap';
import { platform } from 'os';

const rest = new REST({ version: '10' }).setToken(TOKEN);

const cmd = COMMANDS

try {
  //Download the yt-dlp binary for the given version and platform to the provided path.
  //By default the latest version will be downloaded to "./yt-dlp" and platform = os.platform().
  await YTDlpWrap.downloadFromGithub(
    `./binaries/yt-dlp${platform() === 'win32' ? '.exe' : ''}`, //Platform dependent
    undefined,
    platform()
  );
} catch (error) {
  console.error(error);
}


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