import { useState, useEffect } from 'react';
import { taskService } from '@/services/task.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskCard from '@/components/TaskCard';
import { Plus, Search, SlidersHorizontal, Loader2, ListTodo } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskFilters } from '@/types';
import { toast } from 'sonner';

interface TaskListProps {
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  refreshTrigger?: number;
  onStatsRefresh?: () => void;
}

export default function TaskList({ onCreateTask, onEditTask, refreshTrigger, onStatsRefresh }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'open',
    sortBy: 'due_date',
    sortOrder: 'asc',
    limit: 25,
    page: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [filters, refreshTrigger]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTasks(filters);
      setTasks(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      const result = await taskService.completeTask(taskId);
      
      // Show XP notification
      toast.success(`Task completed! +${result.xpAwarded} XP`, {
        description: result.leveledUp 
          ? `🎉 Level Up! You're now level ${result.newLevel}!`
          : `Total XP: ${result.newTotalXp}`,
        duration: 5000,
      });

      // Reload tasks
      loadTasks();
      
      // Trigger stats refresh in parent
      if (onStatsRefresh) {
        onStatsRefresh();
      }
    } catch (error: any) {
      console.error('Failed to complete task:', error);
      toast.error(error.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted successfully');
      loadTasks();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleArchive = async (taskId: string) => {
    try {
      await taskService.archiveTask(taskId);
      toast.success('Task archived successfully');
      loadTasks();
    } catch (error: any) {
      console.error('Failed to archive task:', error);
      toast.error(error.response?.data?.message || 'Failed to archive task');
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters({
      ...filters,
      priority: priority === 'all' ? undefined : (priority as TaskPriority),
      page: 1,
    });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters({ ...filters, sortBy: sortBy as any, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const filteredTasks = searchQuery 
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Quests</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your tasks and earn XP
          </p>
        </div>
        <Button onClick={onCreateTask} size="lg" className="cursor-pointer">
          <Plus className="mr-2 h-5 w-5" />
          Create Task
        </Button>
      </div>

      {/* Tabs for status filtering */}
      <Tabs value={filters.status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-slate-100 dark:bg-neutral-800' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-neutral-900">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Priority
              </label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={handlePriorityFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Sort by
              </label>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
        </div>
      )}

      {/* Task grid */}
      {!isLoading && filteredTasks && filteredTasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onEdit={onEditTask}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!filteredTasks || filteredTasks.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800">
            <ListTodo className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : filters.status === 'open'
              ? 'Create your first task to start earning XP!'
              : `You don't have any ${filters.status} tasks`}
          </p>
          {!searchQuery && filters.status === 'open' && (
            <Button onClick={onCreateTask} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredTasks && filteredTasks.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

