const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// スラッシュコマンドの登録
client.once('ready', async () => {
  console.log('Bot is ready!');

  // コマンドデータ
  const bindingCommand = new SlashCommandBuilder()
    .setName('binding')
    .setDescription('ランダムな武器をリッチテキストで表示します');

  // コマンドを登録（グローバルまたは特定のギルド）
  try {
    await client.application.commands.set([bindingCommand]);
    console.log('スラッシュコマンドを登録しました');
  } catch (error) {
    console.error('コマンド登録エラー:', error);
  }
});

// 既存のメッセージコマンド
client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content === '!dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    message.reply(`サイコロの結果: ${roll}`);
  }
});

// スラッシュコマンドの処理
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'binding') {
    const weapons = ['SR', 'SG', 'AR', 'SMG', 'LMG', 'DMR', 'BOW'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

    // リッチテキスト（Embed）の作成
    const embed = new EmbedBuilder()
      .setTitle('ランダムな武器')
      .setDescription(`あなたの武器は: **${randomWeapon}**`)
      .setColor('#00ff00') // 緑色（カスタマイズ可能）
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);