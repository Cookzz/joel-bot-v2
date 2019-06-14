const Discord = require('discord.js');

const client = new Discord.Client();
const token = 'NDM0Nzg1MzY5NDc3NzQyNTky.DbSlZA.A0OQGlz3Jp7WUJgr1D-NNf1P1eE';



client.login(token)

client.on('ready', () => {
    console.log('client is ready')
});

client.on("error", function () {
    console.log("client error!")
});
