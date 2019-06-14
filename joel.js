const Discord = require('discord.js');

const Host = require('./host.js');

const client = new Discord.Client();
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';
const prefix = ","


const host=new Host(client)
client.login(token)

client.on('ready', () => {
    console.log('joel bot ready')
});

client.on("error", function () {
    console.log("error!")
});

client.on('message', async message => host.onMessage(message));
