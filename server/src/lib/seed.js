import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

export async function seedDemoUser() {
  try {
    const demoEmail = 'alex.dev@lifeos.io';
    const existing = await prisma.user.findUnique({
      where: { email: demoEmail }
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('LifeOS2026!', 10);
      await prisma.user.create({
        data: {
          name: 'Alex Dev',
          email: demoEmail,
          password: hashedPassword,
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        }
      });
      console.log('✅ Demo account seeded: alex.dev@lifeos.io / LifeOS2026!');
    }
  } catch (err) {
    console.warn('Note: Demo seeding skipped or user exists:', err.message);
  }
}

seedDemoUser();
