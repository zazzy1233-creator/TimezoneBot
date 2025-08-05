require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// Discord bot token and guild ID from your .env file
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// Country code to timezone mapping (clean, no duplicates)
const countryToTimezone = {
  AE: "GMT", AF: "GMT", AL: "GMT", AM: "GMT", AO: "GMT", AT: "GMT", AZ: "GMT",
  BA: "GMT", BE: "GMT", BF: "GMT", BG: "GMT", BI: "GMT", BJ: "GMT", BW: "GMT",
  BY: "GMT", CD: "GMT", CF: "GMT", CG: "GMT", CH: "GMT", CI: "GMT", CM: "GMT",
  CV: "GMT", CZ: "GMT", DE: "GMT", DJ: "GMT", DK: "GMT", DZ: "GMT", EE: "GMT",
  EG: "GMT", ES: "GMT", FI: "GMT", FR: "GMT", GA: "GMT", GB: "GMT", GE: "GMT",
  GH: "GMT", GM: "GMT", GN: "GMT", GQ: "GMT", GR: "GMT", HR: "GMT", HU: "GMT",
  IE: "GMT", IL: "GMT", IQ: "GMT", IR: "GMT", IS: "GMT", IT: "GMT", JO: "GMT",
  KE: "GMT", KG: "GMT", KH: "GMT", KM: "GMT", KW: "GMT", KZ: "GMT", LB: "GMT",
  LI: "GMT", LK: "GMT", LR: "GMT", LS: "GMT", LT: "GMT", LU: "GMT", LV: "GMT",
  LY: "GMT", MA: "GMT", MD: "GMT", ME: "GMT", MG: "GMT", MK: "GMT", ML: "GMT",
  MR: "GMT", MT: "GMT", MU: "GMT", MZ: "GMT", NA: "GMT", NE: "GMT", NG: "GMT",
  NL: "GMT", NO: "GMT", OM: "GMT", PL: "GMT", PS: "GMT", PT: "GMT", QA: "GMT",
  RO: "GMT", RS: "GMT", RU: "GMT", RW: "GMT", SA: "GMT", SD: "GMT", SE: "GMT",
  SI: "GMT", SK: "GMT", SO: "GMT", SS: "GMT", ST: "GMT", SY: "GMT", TD: "GMT",
  TG: "GMT", TN: "GMT", TR: "GMT", TZ: "GMT", UA: "GMT", UG: "GMT", VA: "GMT",
  VE: "GMT", YT: "GMT", ZA: "GMT", ZM: "GMT", ZW: "GMT",

  AG: "EST", AI: "EST", AR: "EST", AW: "EST", BB: "EST", BM: "EST", BS: "EST",
  BZ: "EST", CA: "EST", CL: "EST", CO: "EST", CR: "EST", CU: "EST", DO: "EST",
  DM: "EST", EC: "EST", GD: "EST", GT: "EST", GY: "EST", HN: "EST", HT: "EST",
  JM: "EST", KN: "EST", KY: "EST", LC: "EST", MF: "EST", MS: "EST", NI: "EST",
  PA: "EST", PE: "EST", PR: "EST", PY: "EST", SR: "EST", SV: "EST", TC: "EST",
  TT: "EST", US: "EST", VC: "EST", VG: "EST", VI: "EST",

  AS: "AEST", AU: "AEST", CK: "AEST", FJ: "AEST", KI: "AEST", MH: "AEST",
  FM: "AEST", NC: "AEST", NZ: "AEST", NU: "AEST", NF: "AEST", MP: "AEST",
  PW: "AEST", PG: "AEST", SB: "AEST", TK: "AEST", TO: "AEST", TV: "AEST",
  VU: "AEST", WF: "AEST",

  BD: "AEST", BH: "GMT", BN: "AEST", BT: "GMT", CN: "AEST", HK: "AEST",
  ID: "AEST", IN: "GMT", JP: "AEST", KR: "AEST", LA: "AEST", MM: "AEST",
  MN: "GMT", MO: "AEST", MY: "AEST", NP: "GMT", PH: "AEST", PK: "GMT",
  SG: "AEST", TH: "AEST", TJ: "GMT", TM: "GMT", TW: "AEST", UZ: "GMT", VN: "AEST", YE: "GMT"
};

// Timezone role IDs - replace these with your actual Discord role IDs
const timezoneRoles = {
  GMT: "1355249922546335764",
  EST: "1355249948089647154",
  AEST: "1355249970474647643"
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.post('/assign-role', async (req, res) => {
  const { robloxUserId, countryCode } = req.body;
  if (!robloxUserId || !countryCode) {
    return res.status(400).send('Missing robloxUserId or countryCode');
  }

  const timezone = countryToTimezone[countryCode.toUpperCase()] || "GMT";
  const roleId = timezoneRoles[timezone];
  if (!roleId) {
    return res.status(400).send('Invalid timezone mapping');
  }

  try {
    const guild = await client.guilds.fetch(GUILD_ID);

    // ** IMPORTANT: You need a way to map RobloxUserId to DiscordUserId **
    // For example, maintain a database or request user link beforehand
    // For this example, let's assume robloxUserId == discordUserId for simplicity
    // You **must** replace this logic with your actual linking system
    const discordUserId = robloxUserId;

    const member = await guild.members.fetch(discordUserId);
    if (!member) return res.status(404).send('Discord user not found in guild');

    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
      console.log(`Assigned role ${timezone} to user ${discordUserId}`);
    }
    return res.send('Role assigned successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

client.login(DISCORD_BOT_TOKEN);
