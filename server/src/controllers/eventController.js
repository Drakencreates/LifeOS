import prisma from '../lib/prisma.js';

/** GET /api/events */
export async function getEvents(req, res) {
  try {
    const { search, categoryId, importance, sort = 'desc' } = req.query;

    const where = { userId: req.user.id };
    if (categoryId) where.categoryId = categoryId;
    if (importance) where.importance = importance;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: { category: true },
      orderBy: { eventDate: sort === 'asc' ? 'asc' : 'desc' }
    });

    res.json({ success: true, data: events });
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
}

/** GET /api/events/:id */
export async function getEvent(req, res) {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { category: true }
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) {
    console.error('getEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
}

/** POST /api/events */
export async function createEvent(req, res) {
  try {
    const { title, description, eventDate, location, categoryId, importance, visibility } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Event title is required.' });
    }
    if (!eventDate) {
      return res.status(400).json({ success: false, message: 'Event date is required.' });
    }

    // Verify category belongs to user if provided
    if (categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.user.id }
      });
      if (!cat) return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const event = await prisma.event.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        eventDate: new Date(eventDate),
        location: location?.trim() || null,
        categoryId: categoryId || null,
        importance: importance || 'Normal',
        visibility: visibility || 'Private'
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
}

/** PUT /api/events/:id */
export async function updateEvent(req, res) {
  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found.' });

    const { title, description, eventDate, location, categoryId, importance, visibility } = req.body;

    if (categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.user.id }
      });
      if (!cat) return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(importance && { importance }),
        ...(visibility && { visibility })
      },
      include: { category: true }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
}

/** DELETE /api/events/:id */
export async function deleteEvent(req, res) {
  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found.' });

    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
}
