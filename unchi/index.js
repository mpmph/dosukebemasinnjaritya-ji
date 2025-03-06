const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', async () => {
  console.log('Bot is ready!');

  // コマンド1: /binding
  const bindingCommand = new SlashCommandBuilder()
    .setName('binding')
    .setDescription('ランダムな武器をリッチテキストで表示します');

  // コマンド2: /weponomikuji
  const weponomikujiCommand = new SlashCommandBuilder()
    .setName('weponomikuji')
    .setDescription('今日の武器おみくじを引きます');

  // コマンドを登録
  try {
    await client.application.commands.set([bindingCommand, weponomikujiCommand]);
    console.log('スラッシュコマンドを登録しました');
  } catch (error) {
    console.error('コマンド登録エラー:', error);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content === '!dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    message.reply(`サイコロの結果: ${roll}`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'binding') {
    const weapons = ['SR', 'SG', 'AR', 'SMG', 'LMG', 'DMR', 'BOW'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

    const embed = new EmbedBuilder()
      .setTitle('ランダムな武器')
      .setDescription(`あなたの武器は: **${randomWeapon}**`)
      .setColor('#00ff00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'weponomikuji') {
    const weapons = ['SR', 'SG', 'AR', 'SMG', 'LMG', 'DMR', 'BOW'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

    await interaction.reply(`今日は${randomWeapon}が当たる日かも…？`);
  }
});

client.login(process.env.DISCORD_TOKEN);