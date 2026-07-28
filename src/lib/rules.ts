import { prisma } from './db';

/**
 * Business Rule 4: Auto update status to 'Overdue' if deadline has passed and not Completed.
 */
export async function syncOverdueItems(coupleId: string = 'couple-1') {
  const now = new Date();
  await prisma.plannerItem.updateMany({
    where: {
      coupleId,
      deadline: { lt: now },
      status: { notIn: ['Completed', 'Cancelled', 'Overdue'] },
    },
    data: {
      status: 'Overdue',
    },
  });
}

/**
 * Business Rule 6: Validate Bucket deletion.
 * Cannot delete Bucket if it has incomplete PlannerEvents.
 */
export async function validateBucketDeletion(plannerItemId: string): Promise<{ canDelete: boolean; message?: string }> {
  const incompleteEvents = await prisma.plannerEvent.count({
    where: {
      plannerItemId,
      isCompleted: false,
    },
  });

  if (incompleteEvents > 0) {
    return {
      canDelete: false,
      message: `Không thể xóa Bucket vì vẫn còn ${incompleteEvents} sự kiện liên kết chưa hoàn thành. Vui lòng hoàn thành hoặc xóa tất cả Event trước!`,
    };
  }

  return { canDelete: true };
}

/**
 * Business Rule 7: Check if all checklist items are completed.
 * Returns prompt flag if all completed, but DOES NOT auto-update status.
 */
export async function checkChecklistCompletionStatus(plannerItemId: string): Promise<{ allCompleted: boolean; total: number; completed: number }> {
  const checklists = await prisma.plannerChecklist.findMany({
    where: { plannerItemId },
  });

  if (checklists.length === 0) {
    return { allCompleted: false, total: 0, completed: 0 };
  }

  const completedCount = checklists.filter(c => c.isCompleted).length;
  const allCompleted = completedCount === checklists.length;

  return {
    allCompleted,
    total: checklists.length,
    completed: completedCount,
  };
}

/**
 * Types & Types Definitions for Couple Planner
 */
export type ItemType = 'Event' | 'Bucket' | 'Task' | 'Anniversary' | 'Birthday' | 'Reminder';
export type ItemStatus = 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
export type ItemPriority = 'Low' | 'Medium' | 'High' | 'Critical';
