const { PineconeClient } = require("@pinecone-database/pinecone");

const pinecone = new PineconeClient();

pinecone.init({      
	environment: "asia-southeast1-gcp-free",      
	apiKey:      process.env.PINECONE_API_KEY
});

async function include(id, vector, namespace, metadata) {
    const index = await pinecone.Index("arielapp");

    await index.upsert({
        vectors: [
            {
                id: id,
                values: vector,
                metadata: { content: metadata },
            }
        ],
        namespace: namespace
    });
}

async function deleteNamespace(namespace) {
    const index = await pinecone.Index("arielapp");

    return await index.delete1({
        deleteAll: true,
        namespace: namespace
    });
}

module.exports = { include, deleteNamespace };
