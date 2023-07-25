const fs = require('fs').promises;
const textToVector = require("./openai");
const { include,deleteNamespace } = require("./pinecone");

async function insertTechnicalInfo(){
    try {
        const chunks = textToChunks(importContent(), 50);
        const vectors = []

        chunks.forEach(element => {
            vectors.push(textToVector(element));
        });

        for (var i = 0; i < chunks.length; i++) {
            include("tec-" + i,vectors[i],"tecnico",chunks[i]);
        }
    } catch (error) {
        console.error("Erro ao subir as informações técnicas");
        throw error;
    }
}

async function resetTechnicalInfo() {
    deleteNamespace("tecnico");
    insertTechnicalInfo();
}

async function importContent() {
    try {
        return await fs.readFile('informacao_tecnico.txt', 'utf-8');;
    } catch (error) {
        console.error("Erro ao ler o arquivo:", error);
        throw error;
    }
}

function textToChunks(content, amountLines) {
    const lines = content.split('\n');
    const chunks = [];

    for (let i = 0; i < lines.length; i += amountLines) {
        chunks.push(lines.slice(i, i + amountLines).join('\n'));
    }

    return chunks;
}

module.exports = { insertTechnicalInfo,resetTechnicalInfo};