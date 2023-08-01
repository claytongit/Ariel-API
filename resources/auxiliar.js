const fs    = require('fs');
const { getChatCompletion, textToVector } = require("./openai");
const { include, deleteNamespace, searchBySimilarity } = require("./pinecone");
const { setHistoryChat, getHistoryChat } = require('./redis');

async function askGPT(question, userId) {
    try {
        const getHistoryRedis = await getHistoryChat(userId);
        let historyChatRedis  = [];

        if ( getHistoryRedis !== null ) {
            historyChatRedis = JSON.parse(getHistoryRedis);
        }

        historyChatRedis.push({"role": "user", "content": question});

        const questionVector = await textToVector(question);
        const technicalInfo  = await searchBySimilarity(questionVector);
        const result         = await getChatCompletion(question, technicalInfo, historyChatRedis);

        historyChatRedis.push(result.answer);

        if (result.currentTokenSize >= 16384) {
            await restartHistory(historyChatRedis);
            historyChatRedis = [];
        }

        setHistoryChat(userId, historyChatRedis);

        return result.answer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function restartHistory(historyChatRedis) {
    let content = "";
    var i = 1;

    for (; i < historyChatRedis.length; i = i + 2) {
        content += historyChatRedis[i].content + "\n" + 
                   historyChatRedis[i+1].content + "\n";

        if (content.length >= 400) {
            let vector = await textToVector(content);
            await include(content.substring(0, 8) + i,vector,"user",content);

            content = "";
        }
    }

    if (content.length > 0) {
        let vector = await textToVector(content);
        await include(content.substring(0, 8) + i,vector,"user",content);
    }
}

async function insertTechnicalInfo(){
    try {
        const chunks = importContent().split("===");
        var vectors = [];
        
        for (const chunk of chunks) {
            let vector = await textToVector(chunk);
            vectors.push(vector);
        }
        
        for (var i = 0; i < chunks.length; i++) {
            await include("tec-" + i,vectors[i],"tecnico",chunks[i]);
        }
    } catch (error) {
        console.error("Erro ao subir as informações técnicas");
        console.error(error);
        throw error;
    }
}

async function resetTechnicalInfo() {
    await deleteNamespace("tecnico");
    await insertTechnicalInfo();
}

function importContent() {
    try {
        return fs.readFileSync('./resources/informacao_tecnico.txt', 'utf8');
    } catch(error) {
        console.error("Erro ao ler o documento");
        console.error(error);
    }
}

module.exports = { askGPT, checkHistory };