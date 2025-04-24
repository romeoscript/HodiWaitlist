const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Initialize the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the service role key for writing data
const supabase = createClient(supabaseUrl, supabaseKey);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!getcode')) {
    const userId = message.author.id;
    const code = await generateInvitationCode(userId);

    if (code) {
      message.reply(`Your invitation code is: ${code}`);
    } else {
      message.reply('Error generating invitation code. Please try again later.');
    }
  }
});

async function generateInvitationCode(userId) {
  const code = Math.random().toString(36).substring(2, 15); // Generate a random code

  const { data, error } = await supabase
    .from('invitation_codes')
    .insert([{ code, generated_by: userId }]);

  if (error) {
    console.error('Error generating invitation code', error);
    return null;
  }

  return code;
}

client.login(process.env.DISCORD_CLIENT_ID);
