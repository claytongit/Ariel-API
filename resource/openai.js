const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

var currentTokenSize = 0;
var historyChat = [
    {
        "role": "system", 
        "content": "You are a Brazilian salesman working with telesales in a retail store, selling products to a client via Whatsapp. The client just asked you a question and you need to answer it in portuguese. You have to answer as naturally as possible. If you need to refer to the product, use the product's name inside the information provided. You must answer the question using the information below. Both the question and the information are in portuguese and separated with single quotes.\n\nInformation: "
    }
];

async function getChatCompletion(prompt) {
    try {
        history.push({"role": "user", "content": prompt});

        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: history
        });

        const answer = completion.choices[0].message.content;
        currentTokenSize = completion.usage.total_tokens;

        history.push({"role": "assistant", "content": answer});

        return answer;
    } catch (error) {
        console.error("Erro ao chamar a API da OpenAI");
        throw error;
    }
}
/*
function checkHistorySize() {
    if (currentTokenSize >= 8092) {
        let content = "";

        for (var i = 1; i < historyArray.length; i++) {
            content += historyArray[i].content + "\n";
        }
        // Transforma o conteúdo do array de JSON em vetores
        // e envia os vetores para o Pinecone
        historyChat = [historyChat[0]];
    }
}
*/
async function textToVector(text) {
    const resp = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text
    })

    return embedding.data.data[0].embedding
}

module.exports = { getChatCompletion, checkTokenLimit };
