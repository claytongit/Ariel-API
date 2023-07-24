const { Configuration, OpenAIApi } = require("openai");
// const {  } = require("./pinecone");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_KEY
});

var currentTokenSize = 0;
var historyChat = [{"role": "system", "content": "You are a helpful assistant."}];
const openai = new OpenAIApi(configuration);

async function getChatCompletion(prompt) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: history
        });

        const answer = completion.choices[0].message.content;

        currentTokenSize = completion.usage.total_tokens;

        history.push({"role": "user", "content": prompt});
        history.push({"role": "assistant", "content": answer});

        return completion;
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        throw error;
    }
}

function historySizeCheck() {
    if (currentTokenSize >= 8092) {
        let content = "";

        for (var i = 1; i < historyArray.length; i++) {
            content += historyArray[i] + "\n";
        }
        // Transforma o conteúdo do array de JSON em vetores
        // e envia os vetores para o Pinecone
        historyChat = [historyChat[0]];
    }
}

module.exports = { getChatCompletion, checkTokenLimit };
