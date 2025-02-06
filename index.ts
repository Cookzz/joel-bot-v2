import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import { TOKEN, CLIENT_ID } from './config.json'
import COMMANDS from './src/commands'
import Host from './src/host';

const rest = new REST({ version: '10' }).setToken(TOKEN);

const cmd = COMMANDS

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

  const url = interaction.options.getString('url') ?? 'No url provided';

  if (interaction.commandName === 'play') {
    // await interaction.reply(`Pong this - ${reason}`);

    host.onCommand(interaction, interaction.commandName, url)
  }

});


client.login(TOKEN);