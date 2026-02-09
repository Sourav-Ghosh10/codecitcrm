const { MongoClient } = require('mongoose').mongo;

// Source (Direct) and Destination (Direct) URIs
const SOURCE_URI = "mongodb://hashtagcrm:HashtagCrm@ac-gzmerjk-shard-00-00.0mxsnyp.mongodb.net:27017,ac-gzmerjk-shard-00-01.0mxsnyp.mongodb.net:27017,ac-gzmerjk-shard-00-02.0mxsnyp.mongodb.net:27017/hashtagcrm?ssl=true&authSource=admin";
const DEST_URI = "mongodb://CodecIT:CodecIT%40123@ac-shfpi4o-shard-00-00.btuerg6.mongodb.net:27017,ac-shfpi4o-shard-00-01.btuerg6.mongodb.net:27017,ac-shfpi4o-shard-00-02.btuerg6.mongodb.net:27017/codecitcrm?ssl=true&authSource=admin";

async function migrate() {
    const sourceClient = new MongoClient(SOURCE_URI, { connectTimeoutMS: 10000 });
    const destClient = new MongoClient(DEST_URI, { connectTimeoutMS: 10000 });

    try {
        console.log('Connecting to Source...');
        await sourceClient.connect();

        console.log('Connecting to Destination...');
        await destClient.connect();

        console.log('Connected to both databases');

        const sourceDb = sourceClient.db('hashtagcrm');
        const destDb = destClient.db('codecitcrm');

        const collections = await sourceDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log('Collections to migrate:', collectionNames.filter(name => name !== 'users' && !name.startsWith('system.')));

        for (const name of collectionNames) {
            if (name === 'users' || name.startsWith('system.')) {
                console.log(`Skipping collection: ${name}`);
                continue;
            }

            console.log(`Migrating collection: ${name}...`);

            const sourceCollection = sourceDb.collection(name);
            const destCollection = destDb.collection(name);

            // Fetch all documents from source
            const documents = await sourceCollection.find({}).toArray();

            if (documents.length > 0) {
                console.log(`Found ${documents.length} documents in ${name}. Inserting into destination...`);
                try {
                    // Using insertMany with ordered: false to skip duplicates if any
                    const result = await destCollection.insertMany(documents, { ordered: false });
                    console.log(`Successfully migrated ${result.insertedCount} documents for ${name}`);
                } catch (insertErr) {
                    if (insertErr.code === 11000) {
                        console.log(`Some documents already exist in ${name}, continuing...`);
                    } else {
                        console.error(`Error inserting into ${name}:`, insertErr.message);
                    }
                }
            } else {
                console.log(`Collection ${name} is empty, skipping data migration.`);
            }
        }

        console.log('\nMigration process finished successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sourceClient.close();
        await destClient.close();
    }
}

migrate();
