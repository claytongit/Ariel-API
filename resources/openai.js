const { Configuration, OpenAIApi } = require("openai");
const dotenv                       = require("../node_modules/dotenv");

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.YOUR_ORG_ID
});

const openai = new OpenAIApi(configuration);
const masterPrompt = `Prompt:
Read the context and folow the instructions below. Before sending the answer, make sure the answer follows the instructions and is inside the context.

Context:
- You are a Brazilian salesman working with a SaaS company selling products to people via Whatsapp. You are having a conversation with a customer and this customer asked you a question. You also received some technical information of the product you are selling to help you answer the question. All the data provided to is in Portuguese.

Instructions:
- Answer the question in a natural and simple portuguese 
- Use the technical information below to help you answer the question
- Answer shortly, around 50 words

Technical Information:
`;

let system = [];

async function getChatCompletion(question, technicalInfo, historyChatRedis) {
    try {
        historyChatRedis.unshift({
            "role": "system", 
            "content": (masterPrompt + technicalInfo)
        });

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            temperature: 0.7,
            messages: historyChatRedis
        });
        
        let answer = completion.data.choices[0].message;
        let currentTokenSize = completion.data.usage.total_tokens;
        
        return { answer, currentTokenSize };
    } catch (error) {
        throw error;
    }
}

async function textToVector(text) {
    const resp = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text
    })

    return resp.data.data[0].embedding;
}

module.exports = { getChatCompletion, textToVector };
