const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

/* Ping Command */
app.command("/fred-bot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();

/* Help Command */
app.command("/fred-bot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/fred-bot-ping - Check bot latency
/fred-bot-help - Get a list of all commands
/fred-bot-catfact - Get a random cat fact
/fred-bot-joke - Get a random joke
/fred-bot-cipher [encode/decode] [text] - Decodes/Encodes text with the Ceasar Cipher`
  });
});


/* Catfact Command */
app.command("/fred-bot-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});


/* Joke Command */
app.command("/fred-bot-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

/* Ceaser Cipher */

function ceasarCipher(str, shift){
  if (shift < 0) {
    shift = (shift % 26) + 26;
  }

  return str.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);

      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 97);
      }

      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) +97);
      }
    }

    return char;
  }).join('');
}

app.command("/fred-bot-cipher", async ({command, ack, respond}) => {
  await ack();

  const fullText = command.text ? command.text.trim() : "";

  const firstSpaceIndex = fullText.indexOf(" ");

  if (firstSpaceIndex === -1 || !fullText) {
    await respond({
      text: "Please provide mode ('encode' or 'decode') and afterwards your Text!"
    });
    return;
  }

  const mode = fullText.substring(0, firstSpaceIndex).toLowerCase();
  const message = fullText.substring(firstSpaceIndex + 1).trim();

  if (mode === "encode") {
    const encoded = ceasarCipher(message, 3);
    await respond({text: `*Encoded Text:* ${encoded}`});
  } else if (mode === "decode") {
    const decoded = ceasarCipher(message, -3);
    await respond({text: `*Decoded Text:* ${decoded}`});
  } else {
    await respond({
      text: "Unknown Mode! Please use `encode` or `decode`.\nExample: `/fred-bot-cipher decode Hello`"
    });
  }
});