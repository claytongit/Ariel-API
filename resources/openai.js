const { Configuration, OpenAIApi } = require("openai");
const dotenv                       = require("../node_modules/dotenv");

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.YOUR_ORG_ID
});

const openai = new OpenAIApi(configuration);
const masterPrompt = "You are a Brazilian salesman working with telesales selling products to people via Whatsapp. You are having a conversation with a person and this person just asked you a question. You need to answer the question in portuguese and naturally. You must answer the question using the information below and the conversation history. The information is in portuguese and in between 3 single quotes.\n\nInformation: ";

var currentTokenSize = 0;
var historyChat = [
    {
        "role": "system", 
        "content": masterPrompt
    }
];

async function getChatCompletion(question, technicalInfo) {
    try {
        historyChat.push({"role": "user", "content": question});
        historyChat[0].content += technicalInfo;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: historyChat
        });
        
        const answer = completion.data.choices[0].message;
        currentTokenSize = completion.data.usage.total_tokens;

        historyChat.push(answer);
        historyChat[0].content = masterPrompt;
        
        return answer;
    } catch (error) {
        throw error;
    }
}

function getHistoryChat() {
    return historyChat;
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

    return resp.data.data[0].embedding;
}

module.exports = { getChatCompletion, textToVector, getHistoryChat };
