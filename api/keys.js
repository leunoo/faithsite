const clientPromise = require('./_utils/mongodb');
const jwt = require('jsonwebtoken');

const verifyToken = (req) => {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const token = cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

const generateKey = () => {
    const randomNumbers = Math.floor(10000000 + Math.random() * 90000000);
    return `FAITH-${randomNumbers}`;
};

module.exports = async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db('faith_site');
    const collection = db.collection('keys');

    switch (req.method) {
        case 'GET':
            const keys = await collection.find({}).toArray();
            return res.status(200).json(keys);

        case 'POST':
            const { playername } = req.body;
            let newKey = generateKey();

            // Ensure uniqueness
            let exists = await collection.findOne({ key: newKey });
            while (exists) {
                newKey = generateKey();
                exists = await collection.findOne({ key: newKey });
            }

            const keyDoc = {
                key: newKey,
                playername: playername || "unassigned",
                active: "yes",
                createdAt: new Date().toISOString()
            };

            await collection.insertOne(keyDoc);
            return res.status(201).json(keyDoc);

        case 'PUT':
            const { key, active, newPlayername } = req.body;
            const updateData = {};
            if (active) updateData.active = active;
            if (newPlayername) updateData.playername = newPlayername;

            await collection.updateOne({ key }, { $set: updateData });
            return res.status(200).json({ success: true });

        case 'DELETE':
            const { keyToDelete } = req.body;
            await collection.deleteOne({ key: keyToDelete });
            return res.status(200).json({ success: true });

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
};
