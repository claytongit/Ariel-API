const fs = require('fs');
//const client = require("./redis");
const { getChatCompletion, textToVector, getHistoryChat } = require("./openai");
const { include, deleteNamespace, searchBySimilarity } = require("./pinecone");

//client.connect();

async function askGPT(question) {
    try {
        //let historyChatRedis = await client.get('arielKey');
        let questionVector = await textToVector(question);
        let technicalInfo = await searchBySimilarity(questionVector);
        let result = await getChatCompletion(question, technicalInfo, historyChatRedis);

        if (result.currentTokenSize >= 16384) {
            restartHistory(result.historyChat);
        }

        return result.answer;
    } catch (error) {
        console.error("Erro ao perguntar para o GPT");
        console.error(error);
        throw error;
    }
}

function checkHistory() {
    return getHistoryChat();
}

function restartHistory(historyChatRedis) {
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

    //client.set(`arielKey`, key);
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