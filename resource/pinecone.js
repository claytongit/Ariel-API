const { PineconeClient } = require("@pinecone-database/pinecone");

const pinecone = new PineconeClient();

pinecone.init({      
	environment: "asia-southeast1-gcp-free",      
	apiKey:      process.env.PINECONE_API_KEY,
});

module.exports = pinecone;
