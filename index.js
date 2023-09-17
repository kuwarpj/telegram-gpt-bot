
require("dotenv").config();
const keepAlive = require('./server.js')
const TelegramBot = require("node-telegram-bot-api");
const { OpenAIApi, Configuration } = require("openai");

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiApiKey = process.env.API_KEY;

const bot = new TelegramBot(telegramToken, { polling: true });

const configuration = new Configuration({
  apiKey: openaiApiKey,
});

const openai = new OpenAIApi(configuration);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text.toLowerCase(); // Convert the message text to lowercase for case-insensitive comparison

  // Check if the message mentions "hey bot"
  if (messageText.includes("hey bot")) {
    // Notify the user that the bot is typing
    bot.sendChatAction(chatId, "typing");

    try {
      const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: messageText }],
      });

      const response = result.data.choices[0].message.content;
      bot.sendMessage(chatId, `@${msg.from.username} ${response}`);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      bot.sendMessage(chatId, "Sorry, something went wrong. Please try again later.");
    }
  }

  // Check if the message is a question and reply to the specific user
  if (messageText.endsWith("?")) {
    // Notify the user that the bot is typing
    bot.sendChatAction(chatId, "typing");

    try {
      // Extract the user's name and ID
      const userName = msg.from.first_name;
      const userId = msg.from.id;

      const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [{ role: "system", content: "You are a helpful assistant. Your name is Forginu5.0 AI" }, { role: "user", content: messageText }],
      });

      const response = `@${userName} ${result.data.choices[0].message.content}`; // Tag the user in the response
      bot.sendMessage(chatId, response);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      bot.sendMessage(chatId, "Sorry, something went wrong. Please try again later.");
    }
  }
});

bot.on("polling_error", (error) => {
  console.error("Telegram Polling Error:", error);
});

console.log("Bot is online.");

keepAlive()