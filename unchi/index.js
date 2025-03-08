const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Pingエンドポイント
app.get('/ping', (req, res) => {
  res.send('Bot is awake!');
});
app.listen(3000, () => {
  console.log('Ping server running on port 3000');
});

client.once('ready', async () => {
  console.log('Bot is ready!');

  const bindingCommand = new SlashCommandBuilder()
    .setName('binding')
    .setDescription('ランダムな武器をリッチテキストで表示します')
    .addStringOption(option => 
      option.setName('class')
        .setDescription('クラスを指定するとランダムに選ばれます (例: Assault, Medic)')
        .setRequired(false)) // 任意
    .addStringOption(option => 
      option.setName('ammo')
        .setDescription('弾薬を指定するとランダムに選ばれます (例: Light, Heavy)')
        .setRequired(false)); // 任意

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
    const classes = ['Assault', 'Skirmisher', 'controller', 'support', 'Recon'];
    const ammoTypes = ['Light', 'Heavy', 'Energy', 'Shotgun', 'sniper'];

    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

    // オプションの取得（値は使わず、指定されたかどうかのみ確認）
    const hasClassOption = interaction.options.getString('class') !== null;
    const hasAmmoOption = interaction.options.getString('ammo') !== null;

    // Embedの基本設定
    const embed = new EmbedBuilder()
      .setTitle('ランダムな武器')
      .setDescription(`あなたの武器は: **${randomWeapon}**`)
      .setColor('#00ff00')
      .setTimestamp();

    // クラスが指定された場合のみランダムに選択して表示
    if (hasClassOption) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      embed.addFields({ name: 'クラス', value: randomClass, inline: true });
    }

    // アモが指定された場合のみランダムに選択して表示
    if (hasAmmoOption) {
      const randomAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
      embed.addFields({ name: '弾薬', value: randomAmmo, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'weponomikuji') {
    const weapons = ['SR', 'SG', 'AR', 'SMG', 'LMG', 'DMR', 'BOW'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    await interaction.reply(`今日は${randomWeapon}が当たる日かも…？`);
  }

  if (interaction.commandName === 'pullpack') {
    const rand = Math.random() * 100;
    let rarity;
    if (rand < 0.045) {
      rarity = 'SuperLegend';
    } else if (rand < 5.025) {
      rarity = 'Gold';
    } else if (rand < 12.5) {
      rarity = 'Epic';
    } else if (rand < 62.495) {
      rarity = 'Rare';
    } else {
      rarity = 'Common';
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