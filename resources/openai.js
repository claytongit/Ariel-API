const { Configuration, OpenAIApi } = require("openai");
const dotenv                       = require("../node_modules/dotenv");

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.YOUR_ORG_ID
});

const openai = new OpenAIApi(configuration);
const masterPrompt = `Prompt:
Read the context and folow the instructions below. Before sending the answer, check if the answer follows every single instruction and is inside the context.

Context:
- You are a Brazilian salesman working with telesales selling products to people via Whatsapp. You are having a conversation with a customer and this customer just asked you a question. You also received some technical information to help you answer the question. All the data provided is in Portuguese.

Instructions:
- Answer the question in portuguese
- The answer must be based in the information given to you
- Answer naturally
- Use the technical information as basis to answer the question

Information:
`;

var historyChat = [
    {
        "role": "system", 
        "content": masterPrompt
    }
];

async function getChatCompletion(question, technicalInfo, historyChatRedis) {
    try {
        historyChat.push({"role": "user", "content": question});
        historyChat[0].content += technicalInfo;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: historyChat
        });
        
        let answer = completion.data.choices[0].message;
        let currentTokenSize = completion.data.usage.total_tokens;

        historyChat.push(answer);
        historyChat[0].content = masterPrompt;
        
        return { answer, currentTokenSize, historyChat };
    } catch (error) {
        throw error;
    }
}

function getHistoryChat() {
    return historyChat;
}

async function textToVector(text) {
    const resp = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text
    })

    return resp.data.data[0].embedding;
}

module.exports = { getChatCompletion, textToVector, getHistoryChat };
