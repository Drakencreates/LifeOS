import prisma from '../lib/prisma.js';

const DEFAULT_CATEGORIES = [
  { name: 'Education', color: '#6366f1', icon: 'book-open' },
  { name: 'Career', color: '#0ea5e9', icon: 'briefcase' },
  { name: 'Personal', color: '#8b5cf6', icon: 'user' },
  { name: 'Travel', color: '#10b981', icon: 'map-pin' },
  { name: 'Finance', color: '#f59e0b', icon: 'dollar-sign' },
  { name: 'Health', color: '#ef4444', icon: 'heart' },
  { name: 'Achievements', color: '#f97316', icon: 'award' },
  { name: 'Projects', color: '#06b6d4', icon: 'folder' },
  { name: 'Other', color: '#94a3b8', icon: 'tag' }
];

/** GET /api/categories */
export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

/** POST /api/categories */
export async function createCategory(req, res) {
  try {
    const { name, color, icon } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || 'tag'
      },
      include: { _count: { select: { events: true } } }
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

/** PUT /api/categories/:id */
export async function updateCategory(req, res) {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, color, icon } = req.body;
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon && { icon })
      },
      include: { _count: { select: { events: true } } }
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

/** DELETE /api/categories/:id */
export async function deleteCategory(req, res) {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
}

/** Seed default categories for a new user */
export async function seedDefaultCategories(userId) {
  const count = await prisma.category.count({ where: { userId } });
  if (count > 0) return;
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId }))
  });
}
