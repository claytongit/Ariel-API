const fs = require('fs');
const textToVector = require("./openai").textToVector;
const { include, deleteNamespace } = require("./pinecone");

async function insertTechnicalInfo(){
    try {
        const chunks = importContent().split("===");
        var vectors = [];
        
        for (const chunk of chunks) {
            let vector = await textToVector(chunk);
            vectors.push(vector);
        }
        
        for (var i = 0; i < chunks.length; i++) {
            include("tec-" + i,vectors[i],"tecnico",chunks[i]);
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

module.exports = { insertTechnicalInfo,resetTechnicalInfo };