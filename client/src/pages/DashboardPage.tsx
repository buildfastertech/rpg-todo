import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskList from '@/components/TaskList';
import TaskFormDialog from '@/components/TaskFormDialog';
import { PullToRefresh } from '@/components/PullToRefresh';
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

  const handleRefresh = async () => {
    // Trigger refresh and wait a bit for visual feedback
    handleStatsRefresh();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <MainLayout refreshTrigger={refreshTrigger}>
      <PullToRefresh onRefresh={handleRefresh}>
        <TaskList 
          refreshTrigger={refreshTrigger}
          onCreateTask={handleCreateTask} 
          onEditTask={handleEditTask}
          onStatsRefresh={handleStatsRefresh}
        />
      </PullToRefresh>
      <TaskFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />
    </MainLayout>
  );
}

