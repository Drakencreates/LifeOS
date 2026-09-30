import prisma from '../lib/prisma.js';

/** GET /api/memories */
export async function getMemories(req, res) {
  try {
    const { search, sort = 'desc' } = req.query;

    const where = { userId: req.user.id };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    const memories = await prisma.memory.findMany({
      where,
      orderBy: { memoryDate: sort === 'asc' ? 'asc' : 'desc' }
    });

    res.json({ success: true, data: memories });
  } catch (err) {
    console.error('getMemories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch memories.' });
  }
}

/** GET /api/memories/:id */
export async function getMemory(req, res) {
  try {
    const memory = await prisma.memory.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    res.json({ success: true, data: memory });
  } catch (err) {
    console.error('getMemory error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch memory.' });
  }
}

/** POST /api/memories */
export async function createMemory(req, res) {
  try {
    const { title, description, memoryDate, location, imageUrl, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Memory title is required.' });
    }
    if (!memoryDate) {
      return res.status(400).json({ success: false, message: 'Memory date is required.' });
    }

    const tagsFormatted = Array.isArray(tags)
      ? tags.join(',')
      : typeof tags === 'string'
      ? tags.trim()
      : null;

    const memory = await prisma.memory.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        memoryDate: new Date(memoryDate),
        location: location?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        tags: tagsFormatted
      }
    });

    res.status(201).json({ success: true, data: memory });
  } catch (err) {
    console.error('createMemory error:', err);
    res.status(500).json({ success: false, message: 'Failed to create memory.' });
  }
}

/** PUT /api/memories/:id */
export async function updateMemory(req, res) {
  try {
    const existing = await prisma.memory.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Memory not found.' });

    const { title, description, memoryDate, location, imageUrl, tags } = req.body;

    const tagsFormatted = Array.isArray(tags)
      ? tags.join(',')
      : typeof tags === 'string'
      ? tags.trim()
      : tags !== undefined
      ? null
      : undefined;

    const updated = await prisma.memory.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(memoryDate && { memoryDate: new Date(memoryDate) }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
        ...(tagsFormatted !== undefined && { tags: tagsFormatted })
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateMemory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update memory.' });
  }
}

/** DELETE /api/memories/:id */
export async function deleteMemory(req, res) {
  try {
    const existing = await prisma.memory.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Memory not found.' });

    await prisma.memory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Memory deleted successfully.' });
  } catch (err) {
    console.error('deleteMemory error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete memory.' });
  }
}
