require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Your timezone role IDs here
const timezoneRoles = {
  GMT: '1355249922546335764',
  EST: '1355249948089647154',
  AEST: '1355249970474647643',
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.use(express.json());

app.post('/assign-role', async (req, res) => {
  const { discordUserId, timezone } = req.body;

  if (!discordUserId || !timezone) {
    return res.status(400).send('discordUserId and timezone are required.');
  }

  const roleId = timezoneRoles[timezone];
  if (!roleId) {
    return res.status(400).send('Invalid timezone provided.');
  }

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordUserId);

    if (!member) {
      return res.status(404).send('User not found in guild.');
    }

    // Remove all timezone roles before adding the new one
    const rolesToRemove = Object.values(timezoneRoles).filter(r => member.roles.cache.has(r));
    for (const r of rolesToRemove) {
      await member.roles.remove(r);
    }

    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
      console.log(`Added role ${timezone} to user ${discordUserId}`);
    }

    res.send('Role assigned successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error assigning role.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

client.login(DISCORD_BOT_TOKEN);
