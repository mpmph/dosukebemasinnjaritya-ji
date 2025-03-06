const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', async () => {
  console.log('Bot is ready!');

  const bindingCommand = new SlashCommandBuilder()
    .setName('binding')
    .setDescription('ランダムな武器をリッチテキストで表示します');

  const weponomikujiCommand = new SlashCommandBuilder()
    .setName('weponomikuji')
    .setDescription('今日の武器おみくじを引きます');

  const pullpackCommand = new SlashCommandBuilder()
    .setName('pullpack')
    .setDescription('レアリティパックを引きます（SuperLegend 0.045%, Gold 5%, Epic 7.5%, Rare 50%, Common 37.5%）');

  try {
    await client.application.commands.set([bindingCommand, weponomikujiCommand, pullpackCommand]);
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

  if (interaction.commandName === 'pullpack') {
    const rand = Math.random() * 100; // 0〜100のランダムな数値
    let rarity;

    if (rand < 0.045) {
      rarity = 'SuperLegend'; // 0〜0.045% (0.045%)
    } else if (rand < 5.025) {
      rarity = 'Gold'; // 0.045〜5.025% (4.98%)
    } else if (rand < 12.5) {
      rarity = 'Epic'; // 5.025〜12.5% (7.475%)
    } else if (rand < 62.495) {
      rarity = 'Rare'; // 12.5〜62.495% (49.995%)
    } else {
      rarity = 'Common'; // 62.495〜100% (37.505%)
    }

    const embed = new EmbedBuilder()
      .setTitle('パック結果')
      .setDescription(`あなたのパックは: **${rarity}**`)
      .setColor(rarity === 'SuperLegend' ? '#FF0000' : rarity === 'Gold' ? '#ffd700' : rarity === 'Epic' ? '#800080' : rarity === 'Rare' ? '#0000ff' : '#808080')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);