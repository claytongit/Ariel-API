const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);
var historyChat = [{"role": "system", "content": "You are a helpful assistant."}]

async function getChatCompletion(prompt) {
    history.push({"role": "user", "content": prompt});

    try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: history
        });

        const completion = completion.data.choices[0].message;

        history.push({"role": "assistant", "content": completion});

        return completion;
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        throw error;
    }
}

module.exports = getChatCompletion;
