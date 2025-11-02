import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskList from '@/components/TaskList';
import TaskFormDialog from '@/components/TaskFormDialog';
import type { Task } from '@/types';

export default function DashboardPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsFormDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    // Trigger task list refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatsRefresh = () => {
    // Trigger stats refresh (header and task list)
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <MainLayout refreshTrigger={refreshTrigger}>
      <TaskList 
        refreshTrigger={refreshTrigger}
        onCreateTask={handleCreateTask} 
        onEditTask={handleEditTask}
        onStatsRefresh={handleStatsRefresh}
      />
      <TaskFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />
    </MainLayout>
  );
}

