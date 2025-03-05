const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content === '!dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    message.reply(`サイコロの結果: ${roll}`);
  }
});

client.login(process.env.DISCORD_TOKEN); // 環境変数を使用