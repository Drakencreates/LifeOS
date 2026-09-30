import prisma from '../lib/prisma.js';

/** GET /api/goals */
export async function getGoals(req, res) {
  try {
    const { search, status, priority, sort = 'desc' } = req.query;

    const where = { userId: req.user.id };
    if (status && status !== 'All') where.status = status;
    if (priority && priority !== 'All') where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    });

    res.json({ success: true, data: goals });
  } catch (err) {
    console.error('getGoals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch goals.' });
  }
}

/** GET /api/goals/:id */
export async function getGoal(req, res) {
  try {
    const goal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, data: goal });
  } catch (err) {
    console.error('getGoal error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch goal.' });
  }
}

/** POST /api/goals */
export async function createGoal(req, res) {
  try {
    const {
      title,
      description,
      startDate,
      targetDate,
      progress,
      currentValue,
      targetValue,
      unit,
      priority,
      status,
      category
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const curVal = Number(currentValue) || 0;
    const tgtVal = Number(targetValue) || (curVal > 0 ? curVal : 100);
    const prog = progress !== undefined
      ? Number(progress)
      : tgtVal > 0
      ? Math.min(100, Math.round((curVal / tgtVal) * 100))
      : 0;

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: prog,
        currentValue: curVal,
        targetValue: tgtVal,
        unit: unit?.trim() || null,
        priority: priority || 'Medium',
        status: status || 'Not Started',
        category: category?.trim() || null
      }
    });

    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    console.error('createGoal error:', err);
    res.status(500).json({ success: false, message: 'Failed to create goal.' });
  }
}

/** PUT /api/goals/:id */
export async function updateGoal(req, res) {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const {
      title,
      description,
      startDate,
      targetDate,
      progress,
      currentValue,
      targetValue,
      unit,
      priority,
      status,
      category
    } = req.body;

    let updatedCurVal = currentValue !== undefined ? Number(currentValue) : existing.currentValue;
    let updatedTgtVal = targetValue !== undefined ? Number(targetValue) : existing.targetValue;
    let updatedProg = progress !== undefined
      ? Number(progress)
      : currentValue !== undefined || targetValue !== undefined
      ? updatedTgtVal > 0
        ? Math.min(100, Math.round((updatedCurVal / updatedTgtVal) * 100))
        : 0
      : existing.progress;

    // Auto-update status if progress reaches 100% or 0%
    let updatedStatus = status || existing.status;
    if (updatedProg >= 100 && updatedStatus === 'In Progress') {
      updatedStatus = 'Completed';
    }

    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        progress: updatedProg,
        currentValue: updatedCurVal,
        targetValue: updatedTgtVal,
        ...(unit !== undefined && { unit: unit?.trim() || null }),
        ...(priority && { priority }),
        status: updatedStatus,
        ...(category !== undefined && { category: category?.trim() || null })
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updateGoal error:', err);
    res.status(500).json({ success: false, message: 'Failed to update goal.' });
  }
}

/** DELETE /api/goals/:id */
export async function deleteGoal(req, res) {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Goal not found.' });

    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Goal deleted successfully.' });
  } catch (err) {
    console.error('deleteGoal error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete goal.' });
  }
}
