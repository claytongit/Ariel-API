const axios = require("axios");

async function getOpenAICompletion(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await axios.post(
        "https://api.openai.com/v1/engines/davinci-codex/completions",
        {
            prompt,
            max_tokens: 150,
        },
        {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ apiKey }`,
            },
        }
        );

        return response.data.choices[0].text;
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        throw error;
    }
}

module.exports = getOpenAICompletion;
