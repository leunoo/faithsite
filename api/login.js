const clientPromise = require('./_utils/mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
        if (!hashedPassword) {
            return res.status(500).json({ error: 'Admin password hash not configured' });
        }

        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (isMatch) {
            const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Set HTTP-only cookie
            res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);

            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
