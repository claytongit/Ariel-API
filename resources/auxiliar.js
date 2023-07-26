const fs = require('fs');
const { getChatCompletion, textToVector, getHistoryChat } = require("./openai");
const { include, deleteNamespace, searchBySimilarity } = require("./pinecone");

async function askGPT(question) {
    try {
        const technicalInfo = await searchBySimilarity(await textToVector(question));
        
        return await getChatCompletion(question, technicalInfo);
    } catch (error) {
        console.error("Erro ao perguntar para o GPT");
        console.error(error);
        throw error;
    }
}

function checkHistory() {
    return getHistoryChat();
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