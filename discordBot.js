const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const dotenv = require('dotenv');
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

console.log('Starting Discord bot...');

if (!DISCORD_TOKEN) {
    console.error('DISCORD_TOKEN is not set');
    process.exit(1);
}

client.once('ready', () => {
    console.log('Discord bot is ready and connected!');
});

client.on('messageCreate', message => {
    console.log(`Received message: ${message.content}`);
    if (message.content === '!invite') {
        message.channel.send('Your invite code is: YOUR_INVITE_CODE');
        console.log('Sent invite code');
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error('Failed to login:', err));
