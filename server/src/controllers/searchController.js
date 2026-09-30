import prisma from '../lib/prisma.js';

/**
 * GET /api/search?q=query
 * Global search across Events, Memories, Goals, Documents, and Categories.
 */
export async function globalSearch(req, res) {
  try {
    const userId = req.user.id;
    const query = (req.query.q || '').trim();

    if (!query) {
      return res.json({
        success: true,
        data: {
          results: [],
          grouped: {
            events: [],
            memories: [],
            goals: [],
            documents: [],
            categories: []
          },
          total: 0
        }
      });
    }

    // Parallel searches
    const [events, memories, goals, documents, categories] = await Promise.all([
      // Events
      prisma.event.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { location: { contains: query } }
          ]
        },
        include: { category: true },
        take: 10
      }),

      // Memories
      prisma.memory.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { location: { contains: query } },
            { tags: { contains: query } }
          ]
        },
        take: 10
      }),

      // Goals
      prisma.goal.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } }
          ]
        },
        take: 10
      }),

      // Documents
      prisma.document.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { fileName: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } }
          ]
        },
        take: 10
      }),

      // Categories
      prisma.category.findMany({
        where: {
          userId,
          name: { contains: query }
        },
        take: 5
      })
    ]);

    // Format normalized items
    const formattedEvents = events.map(e => ({
      id: e.id,
      type: 'EVENT',
      typeLabel: 'Life Event',
      title: e.title,
      description: e.description || e.location || 'Logged on ' + new Date(e.eventDate).toLocaleDateString(),
      date: e.eventDate,
      category: e.category ? e.category.name : null,
      badge: e.importance,
      badgeColor: e.importance === 'Milestone' ? 'amber' : 'indigo',
      link: '/timeline'
    }));

    const formattedMemories = memories.map(m => ({
      id: m.id,
      type: 'MEMORY',
      typeLabel: 'Memory',
      title: m.title,
      description: m.description || m.location || 'Captured memory',
      date: m.memoryDate,
      imageUrl: m.imageUrl,
      tags: m.tags,
      badge: 'Memory',
      badgeColor: 'purple',
      link: '/memories'
    }));

    const formattedGoals = goals.map(g => ({
      id: g.id,
      type: 'GOAL',
      typeLabel: 'Goal',
      title: g.title,
      description: `${g.currentValue} / ${g.targetValue} ${g.unit || ''} (${g.progress}%) • ${g.status}`,
      date: g.targetDate || g.createdAt,
      progress: g.progress,
      badge: g.priority + ' Priority',
      badgeColor: g.status === 'Completed' ? 'emerald' : 'blue',
      link: '/goals'
    }));

    const formattedDocuments = documents.map(d => ({
      id: d.id,
      type: 'DOCUMENT',
      typeLabel: 'Document',
      title: d.title || d.fileName,
      description: `${d.fileName} • ${d.category || 'File'}`,
      date: d.createdAt,
      fileName: d.fileName,
      fileSize: d.fileSize,
      fileType: d.fileType,
      badge: d.category || 'Document',
      badgeColor: 'slate',
      link: '/documents'
    }));

    const formattedCategories = categories.map(c => ({
      id: c.id,
      type: 'CATEGORY',
      typeLabel: 'Category',
      title: c.name,
      description: 'Event category',
      color: c.color,
      icon: c.icon,
      badge: 'Category',
      badgeColor: 'slate',
      link: '/events'
    }));

    const allResults = [
      ...formattedEvents,
      ...formattedMemories,
      ...formattedGoals,
      ...formattedDocuments,
      ...formattedCategories
    ];

    res.json({
      success: true,
      data: {
        query,
        results: allResults,
        grouped: {
          events: formattedEvents,
          memories: formattedMemories,
          goals: formattedGoals,
          documents: formattedDocuments,
          categories: formattedCategories
        },
        total: allResults.length
      }
    });
  } catch (err) {
    console.error('globalSearch error:', err);
    res.status(500).json({ success: false, message: 'Search query failed.' });
  }
}
