const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers } = require('../config/db');
const { registerSchema, loginSchema } = require('../validators/schemas');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const usersCollection = getUsers();
    const existingUser = await usersCollection.findOne({ email: value.email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcryptjs.hash(value.password, 10);
    const result = await usersCollection.insertOne({
      name: value.name,
      email: value.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const usersCollection = getUsers();
    const user = await usersCollection.findOne({ email: value.email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const validPassword = await bcryptjs.compare(value.password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
