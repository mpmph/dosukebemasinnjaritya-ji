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
        .setRequired(false))
    .addStringOption(option => 
      option.setName('ammo')
        .setDescription('弾薬を指定すると対応する武器が選ばれます (ライト, ヘビー, エネルギー, ショットガン, スナイパー)')
        .setRequired(false));

  const weponomikujiCommand = new SlashCommandBuilder()
    .setName('weponomikuji')
    .setDescription('今日の武器おみくじを引きます');

  const pullpackCommand = new SlashCommandBuilder()
    .setName('pullpack')
    .setDescription('レアリティパックを引きます（SuperLegend 0.045%, Gold 5%, Epic 7.5%, Rare 50%, Common 37.5%）');

  const hayokoiCommand = new SlashCommandBuilder()
    .setName('hayokoi')
    .setDescription('指定したメンバーをメンションして「はよこい」と送信します')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('呼び出すメンバーを選択')
        .setRequired(true));

  try {
    await client.application.commands.set([bindingCommand, weponomikujiCommand, pullpackCommand, hayokoiCommand]);
    console.log('スラッシュコマンドを登録しました');
  } catch (error) {
    console.error('コマンド登録エラー:', error);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const content = message.content.trim();
    const timeMatch = content.match(/(\d{1,2}):(\d{2})/);

    if (timeMatch) {
      const [_, hours, minutes] = timeMatch;
      const specifiedHour = parseInt(hours);
      const specifiedMinute = parseInt(minutes);

      if (specifiedHour >= 0 && specifiedHour <= 23 && specifiedMinute >= 0 && specifiedMinute <= 59) {
        scheduleMochiPounding(message.channel, specifiedHour, specifiedMinute);
        message.reply(`了解！${specifiedHour}:${specifiedMinute} の1時間後、2時間後、3時間後に餅つきを通知するよ！`);
      } else {
        message.reply('時間は「HH:MM」形式で0:00～23:59の範囲で指定してね！');
      }
    } else {
      message.reply('私はここにいるよ！餅つきをスケジュールするには「@BotName HH:MM」と入力してね（例: @BotName 10:00）。');
    }
    return;
  }

  if (message.content === '!dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    message.reply(`サイコロの結果: ${roll}`);
  }
});

function scheduleMochiPounding(channel, hour, minute) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

  if (today < now) {
    today.setDate(today.getDate() + 1);
  }

  const oneHourLater = new Date(today.getTime() + 1 * 60 * 60 * 1000);
  const twoHoursLater = new Date(today.getTime() + 2 * 60 * 60 * 1000);
  const threeHoursLater = new Date(today.getTime() + 3 * 60 * 60 * 1000);

  [oneHourLater, twoHoursLater, threeHoursLater].forEach((time) => {
    const delay = time - now;
    if (delay > 0) {
      setTimeout(() => {
        channel.send('@everyone 餅つきやれ');
      }, delay);
    }
  });
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'binding') {
    const allWeapons = ['R-301', 'R-99', 'スピットファイア', 'G7スカウト', 'RE-45', 'P2020', 'オルタネーター', 'プラウラー', 'ヘムロック', 'フラットライン', '30-30リピーター', 'CAR', 'トリプルテイク', 'ボルト', 'Lスター', 'ディボーション', 'ネメシス', 'モザンビーク', 'マスティフ', 'EVA-8', 'チャージライフル', 'センチネル', 'ロングボウ', 'ウィングマン'];
    const ammoWeapons = {
      'ライト': ['R-301', 'R-99', 'スピットファイア', 'G7スカウト', 'RE-45', 'P2020', 'オルタネーター'],
      'ヘビー': ['プラウラー', 'ヘムロック', 'フラットライン', '30-30リピーター', 'CAR'],
      'エネルギー': ['トリプルテイク', 'ボルト', 'Lスター', 'ディボーション', 'ネメシス'],
      'ショットガン': ['モザンビーク', 'マスティフ', 'EVA-8'],
      'スナイパー': ['チャージライフル', 'センチネル', 'ロングボウ', 'ウィングマン']
    };
    const classes = ['アサルト', 'スカーミッシャー', 'コントローラー', 'サポート', 'リコン'];

    const selectedAmmo = interaction.options.getString('ammo');
    let randomWeapon;
    if (selectedAmmo && ammoWeapons[selectedAmmo]) {
      const availableWeapons = ammoWeapons[selectedAmmo];
      randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
    } else {
      randomWeapon = allWeapons[Math.floor(Math.random() * allWeapons.length)];
    }

    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const embed = new EmbedBuilder()
      .setTitle('ランダムな武器')
      .setDescription(`あなたの武器は: **${randomWeapon}**`)
      .setColor('#00ff00')
      .addFields({ name: 'クラス', value: randomClass, inline: true })
      .setTimestamp();

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
    if (rand < 0.045) rarity = 'SuperLegend';
    else if (rand < 5.025) rarity = 'Gold';
    else if (rand < 12.5) rarity = 'Epic';
    else if (rand < 62.495) rarity = 'Rare';
    else rarity = 'Common';
    const embed = new EmbedBuilder()
      .setTitle('パック結果')
      .setDescription(`あなたのパックは: **${rarity}**`)
      .setColor(rarity === 'SuperLegend' ? '#FF0000' : rarity === 'Gold' ? '#ffd700' : rarity === 'Epic' ? '#800080' : rarity === 'Rare' ? '#0000ff' : '#808080')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'hayokoi') {
    const selectedUser = interaction.options.getUser('user');
    console.log(`選択されたユーザー: ${selectedUser.tag} (ID: ${selectedUser.id})`); // デバッグ用ログ
    await interaction.reply(`<@${selectedUser.id}> はよこい`);
  }
});

client.login(process.env.DISCORD_TOKEN);