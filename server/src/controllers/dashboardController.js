import prisma from '../lib/prisma.js';

/**
 * GET /api/dashboard/stats
 * Aggregates all dashboard analytics and overview data from the database.
 */
export async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Parallel counts & data queries
    const [
      totalEvents,
      totalMemories,
      totalGoals,
      completedGoals,
      activeGoals,
      totalDocuments,
      importantEventsCount,
      allEvents,
      recentMemories,
      allGoals,
      recentDocuments,
      categories
    ] = await Promise.all([
      prisma.event.count({ where: { userId } }),
      prisma.memory.count({ where: { userId } }),
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'Completed' } }),
      prisma.goal.count({ where: { userId, status: { in: ['In Progress', 'Not Started'] } } }),
      prisma.document.count({ where: { userId } }),
      prisma.event.count({ where: { userId, importance: { in: ['Important', 'Milestone'] } } }),
      prisma.event.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { eventDate: 'desc' }
      }),
      prisma.memory.findMany({
        where: { userId },
        orderBy: { memoryDate: 'desc' },
        take: 6
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      prisma.category.findMany({
        where: { userId }
      })
    ]);

    // 1. Category Distribution for Events
    const categoryCounts = {};
    allEvents.forEach(evt => {
      const catName = evt.category ? evt.category.name : 'General';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCounts).map(name => {
      const catObj = categories.find(c => c.name === name);
      return {
        name,
        count: categoryCounts[name],
        color: catObj ? catObj.color : '#6366f1',
        percentage: totalEvents > 0 ? Math.round((categoryCounts[name] / totalEvents) * 100) : 0
      };
    }).sort((a, b) => b.count - a.count);

    // 2. Life Timeline Growth by Year
    const currentYear = now.getFullYear();
    const yearsMap = new Map();
    for (let yr = currentYear - 3; yr <= currentYear; yr++) {
      yearsMap.set(yr.toString(), { year: yr.toString(), events: 0, memories: 0, goals: 0 });
    }

    allEvents.forEach(e => {
      const yr = new Date(e.eventDate).getFullYear().toString();
      if (!yearsMap.has(yr)) yearsMap.set(yr, { year: yr, events: 0, memories: 0, goals: 0 });
      yearsMap.get(yr).events += 1;
    });

    recentMemories.forEach(m => {
      const yr = new Date(m.memoryDate).getFullYear().toString();
      if (!yearsMap.has(yr)) yearsMap.set(yr, { year: yr, events: 0, memories: 0, goals: 0 });
      yearsMap.get(yr).memories += 1;
    });

    allGoals.forEach(g => {
      const yr = new Date(g.createdAt).getFullYear().toString();
      if (!yearsMap.has(yr)) yearsMap.set(yr, { year: yr, events: 0, memories: 0, goals: 0 });
      if (g.status === 'Completed') yearsMap.get(yr).goals += 1;
    });

    const lifeOverview = Array.from(yearsMap.values()).sort((a, b) => Number(a.year) - Number(b.year));

    // 3. Goals Overview & Average Progress
    const totalGoalProgressSum = allGoals.reduce((sum, g) => sum + (Number(g.progress) || 0), 0);
    const averageProgress = totalGoals > 0 ? Math.round(totalGoalProgressSum / totalGoals) : 0;

    const goalsOverview = {
      total: totalGoals,
      active: activeGoals,
      completed: completedGoals,
      averageProgress,
      activeList: allGoals.filter(g => g.status !== 'Completed' && g.status !== 'Archived').slice(0, 4)
    };

    // 4. Upcoming Events & Deadlines
    const upcomingEvents = allEvents
      .filter(e => new Date(e.eventDate) >= now)
      .slice(0, 4);

    const upcomingGoalDeadlines = allGoals
      .filter(g => g.targetDate && new Date(g.targetDate) >= now && g.status !== 'Completed')
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 4);

    // 5. Unified Recent Activity Feed
    const activities = [
      ...allEvents.slice(0, 4).map(e => ({
        id: e.id,
        type: 'EVENT',
        title: e.title,
        description: e.description,
        date: e.eventDate,
        createdAt: e.createdAt,
        badge: e.category ? e.category.name : 'Event',
        badgeColor: e.importance === 'Milestone' ? 'amber' : 'indigo',
        link: '/timeline'
      })),
      ...recentMemories.slice(0, 4).map(m => ({
        id: m.id,
        type: 'MEMORY',
        title: m.title,
        description: m.description,
        date: m.memoryDate,
        createdAt: m.createdAt,
        badge: 'Memory',
        badgeColor: 'purple',
        imageUrl: m.imageUrl,
        link: '/memories'
      })),
      ...allGoals.slice(0, 4).map(g => ({
        id: g.id,
        type: 'GOAL',
        title: g.title,
        description: `${g.currentValue} / ${g.targetValue} ${g.unit || ''} (${g.progress}%)`,
        date: g.targetDate || g.createdAt,
        createdAt: g.createdAt,
        badge: g.priority + ' Priority',
        badgeColor: g.status === 'Completed' ? 'emerald' : 'blue',
        link: '/goals'
      })),
      ...recentDocuments.slice(0, 4).map(d => ({
        id: d.id,
        type: 'DOCUMENT',
        title: d.title || d.fileName,
        description: d.fileName,
        date: d.createdAt,
        createdAt: d.createdAt,
        badge: d.category || 'Document',
        badgeColor: 'slate',
        link: '/documents'
      }))
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        stats: {
          totalEvents,
          totalMemories,
          totalGoals,
          completedGoals,
          activeGoals,
          totalDocuments,
          importantEvents: importantEventsCount
        },
        categoryDistribution,
        lifeOverview,
        goalsOverview,
        recentActivity: activities.slice(0, 8),
        upcoming: {
          events: upcomingEvents.length > 0 ? upcomingEvents : allEvents.slice(0, 3),
          goalDeadlines: upcomingGoalDeadlines
        },
        importantEvents: allEvents.filter(e => e.importance === 'Milestone' || e.importance === 'Important').slice(0, 5)
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
}
