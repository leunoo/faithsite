const clientPromise = require('./_utils/mongodb');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { key, playername } = req.body;

    if (!key || !playername) {
        return res.status(400).json({ valid: false, error: 'Key and playername are required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('faith_site');
        const collection = db.collection('keys');

        const keyDoc = await collection.findOne({ key });

        if (!keyDoc) {
            return res.status(200).json({ valid: false, error: 'Key not found' });
        }

        if (keyDoc.active !== 'yes') {
            return res.status(200).json({ valid: false, error: 'Key is inactive' });
        }

        if (keyDoc.playername !== playername) {
            return res.status(200).json({ valid: false, error: 'Playername mismatch' });
        }

        return res.status(200).json({ valid: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ valid: false, error: 'Server error' });
    }
};
