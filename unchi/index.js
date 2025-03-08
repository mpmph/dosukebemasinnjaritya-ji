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
    .setDescription('ランダムな武器とクラスをリッチテキストで表示します')
    .addStringOption(option => 
      option.setName('class')
        .setDescription('クラスを指定してもランダムに選ばれます (例: Assault, Skirmisher)')
        .setRequired(false)) // 任意（効果なし）
    .addStringOption(option => 
      option.setName('ammo')
        .setDescription('弾薬を指定すると対応する武器が選ばれます (ライト, ヘビー, エネルギー, ショットガン, スナイパー)')
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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'binding') {
    // 全武器リスト
    const allWeapons = ['R-301', 'R-99', 'スピットファイア', 'G7スカウト', 'RE-45', 'P2020', 'オルタネーター', 'プラウラー', 'ヘムロック', 'フラットライン', '30-30リピーター', 'CAR', 'トリプルテイク', 'ボルト', 'Lスター', 'ディボーション', 'ネメシス', 'モザンビーク', 'マスティフ', 'EVA-8', 'チャージライフル', 'センチネル', 'ロングボウ', 'ウィングマン'];
    // 弾薬ごとの武器リスト
    const ammoWeapons = {
      'ライト': ['R-301', 'R-99', 'スピットファイア', 'G7スカウト', 'RE-45', 'P2020', 'オルタネーター'],
      'ヘビー': ['プラウラー', 'ヘムロック', 'フラットライン', '30-30リピーター', 'CAR'],
      'エネルギー': ['トリプルテイク', 'ボルト', 'Lスター', 'ディボーション', 'ネメシス'],
      'ショットガン': ['モザンビーク', 'マスティフ', 'EVA-8'],
      'スナイパー': ['チャージライフル', 'センチネル', 'ロングボウ', 'ウィングマン']
    };
    const classes = ['アサルト', 'スカーミッシャー', 'コントローラー', 'サポート', 'リコン'];

    // オプションの取得
    const selectedAmmo = interaction.options.getString('ammo');

    // 武器の選択
    let randomWeapon;
    if (selectedAmmo && ammoWeapons[selectedAmmo]) {
      const availableWeapons = ammoWeapons[selectedAmmo];
      randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
    } else {
      randomWeapon = allWeapons[Math.floor(Math.random() * allWeapons.length)];
    }

    // クラスは常にランダムに選択
    const randomClass = classes[Math.floor(Math.random() * classes.length)];

    // Embedの基本設定
    const embed = new EmbedBuilder()
      .setTitle('ランダムな武器')
      .setDescription(`あなたの武器は: **${randomWeapon}**`)
      .setColor('#00ff00')
      .addFields({ name: 'クラス', value: randomClass, inline: true }) // 常に表示
      .setTimestamp();

    // アモが指定された場合のみ表示
    if (selectedAmmo) {
      embed.addFields({ name: '弾薬', value: selectedAmmo, inline: true });
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