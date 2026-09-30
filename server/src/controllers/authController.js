import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { seedDefaultCategories } from './categoryController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lifeos_fallback_jwt_secret_key';

// Helper to generate JWT
const generateToken = (userId, email, rememberMe = false) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '24h' }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please re-enter.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`
      }
    });

    // Seed default categories for new user
    await seedDefaultCategories(newUser.id);

    const token = generateToken(newUser.id, newUser.email, false);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred during registration.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Ensure the user always has categories (handles existing users)
    await seedDefaultCategories(user.id);

    const token = generateToken(user.id, user.email, rememberMe);
    const { password: _, ...userSafe } = user;

    return res.status(200).json({
      success: true,
      message: 'Successfully logged in to LifeOS.',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected server error occurred during login.' });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully from LifeOS.' });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
