const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

async function getChatCompletion(prompt) {
    try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {"role": "system", "content": "You are a helpful assistant."}, 
            {"role": "user", "content": "Hello world"}
            ],
        });

        return completion.data.choices[0].message;
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        throw error;
    }
}

module.exports = getOpenAICompletion;
