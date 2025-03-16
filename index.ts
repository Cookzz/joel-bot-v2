import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import COMMANDS from './src/commands'
import Host from './src/host';
import { readdirSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
// import { getYtdlpExecutableName } from './src/utils/config.util';

// const YTDlpWrap = require('yt-dlp-wrap-plus').default;

const cmd = COMMANDS

/* Download the required yt-dlp binary depending on the platform from github */
// try {
//   console.log("Check for binary directory")

//   if (!existsSync('./binaries')){
//     console.log("Created directory for binary storage")
//     mkdirSync('./binaries')
//   }

//   console.log("Started downloading yt-dlp binary.")

//   const binaryPath = `./binaries/${getYtdlpExecutableName()}`
//   const hasBinary = existsSync(binaryPath)

//   if (!hasBinary) {
//     await YTDlpWrap.downloadFromGithub(
//       binaryPath, //Platform dependent
//       undefined
//     );
  
//     console.log("Finished downloading yt-dlp binary.")
//   } else {
//     console.log("Binary already exists")
//   }
// } catch (error) {
//   console.error(error);
// }

/* Auto-clear tmp files */
// try {
//   console.log("Clearing tmp files")

//   if (!existsSync('./tmp')){
//       mkdirSync('./tmp')
//   }

//   readdirSync('./tmp').forEach(file => unlinkSync(`./tmp/${file}`));

//   console.log("Cleared tmp files")
// } catch (error) {
//   console.error(error);
// }

/* Handle configuration and initialization */
try {
  /* 1. Check config first */
  console.log("Checking config file")
  const configPath = './config.json'
  if (!existsSync(configPath)){
      throw new Error("No config file found. Please check README and setup one yourself.")
  }
  console.log("Config file exists")

  /* 2. Import if it exists */
  const { TOKEN, CLIENT_ID } = await import(configPath)

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  /* 3. Start registering slash commands */
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: cmd });

  console.log('Successfully reloaded application (/) commands.');

  /* 4. Setup client and login to discord bot */
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
} catch (error) {
  console.error("Config error: ", error);
}