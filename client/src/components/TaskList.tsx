import { useState, useEffect } from 'react';
import { taskService } from '@/services/task.service';
import { labelService } from '@/services/label.service';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskCard from '@/components/TaskCard';
import TaskSkeleton from '@/components/TaskSkeleton';
import { Plus, Search, ListTodo, Filter, ArrowUpDown } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskFilters, Label, Category } from '@/types';
import { toast } from 'sonner';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

interface TaskListProps {
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  refreshTrigger?: number;
  onStatsRefresh?: () => void;
}

export default function TaskList({ onCreateTask, onEditTask, refreshTrigger, onStatsRefresh }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Load labels and categories on mount
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [fetchedLabels, fetchedCategories] = await Promise.all([
          labelService.getLabels(),
          categoryService.getCategories(),
        ]);
        setLabels(fetchedLabels);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    loadFiltersData();
  }, []);

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
    } catch (error) {
      showErrorToast(error, 'Failed to load tasks');
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

      // Show achievement unlock notifications
      if (result.newAchievements && result.newAchievements.length > 0) {
        result.newAchievements.forEach((achievement) => {
          toast.success(`🏆 Achievement Unlocked!`, {
            description: achievement.achievementName,
            duration: 6000,
          });
        });
      }

      // Reload tasks
      loadTasks();
      
      // Trigger stats refresh in parent
      if (onStatsRefresh) {
        onStatsRefresh();
      }
    } catch (error) {
      showErrorToast(error, 'Failed to complete task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      showSuccessToast('Task deleted successfully');
      loadTasks();
    } catch (error) {
      showErrorToast(error, 'Failed to delete task');
    }
  };

  const handleArchive = async (taskId: string) => {
    try {
      await taskService.archiveTask(taskId);
      showSuccessToast('Task archived successfully');
      loadTasks();
    } catch (error) {
      showErrorToast(error, 'Failed to archive task');
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handlePriorityFilter = (priorities: string[]) => {
    setSelectedPriorities(priorities);
    setFilters({
      ...filters,
      priorities: priorities.length > 0 ? priorities as TaskPriority[] : undefined,
      page: 1,
    });
  };

  const handleCategoryFilter = (categories: string[]) => {
    setSelectedCategories(categories);
    setFilters({
      ...filters,
      categories: categories.length > 0 ? categories : undefined,
      page: 1,
    });
  };

  const handleLabelFilter = (labels: string[]) => {
    setSelectedLabels(labels);
    setFilters({
      ...filters,
      labels: labels.length > 0 ? labels : undefined,
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

  const hasActiveFilters = 
    selectedPriorities.length > 0 || 
    selectedCategories.length > 0 || 
    selectedLabels.length > 0;

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
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar - left side */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters - right side */}
        <div className="flex gap-2 flex-wrap">
          <MultiSelectFilter
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Urgent', label: 'Urgent' },
            ]}
            selected={selectedPriorities}
            onChange={handlePriorityFilter}
            placeholder="Priority"
            icon={<Filter className="h-4 w-4" />}
            emptyText="No priorities found"
          />

          <MultiSelectFilter
            options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
            selected={selectedCategories}
            onChange={handleCategoryFilter}
            placeholder="Category"
            icon={<Filter className="h-4 w-4" />}
            emptyText="No categories found"
          />

          <MultiSelectFilter
            options={labels.map((label) => ({ value: label.name, label: label.name }))}
            selected={selectedLabels}
            onChange={handleLabelFilter}
            placeholder="Label"
            icon={<Filter className="h-4 w-4" />}
            emptyText="No labels found"
          />

          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="xp_value">XP Value</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Task grid */}
      {!isLoading && filteredTasks && filteredTasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            {searchQuery || hasActiveFilters
              ? 'No matching tasks'
              : filters.status === 'open'
              ? 'No tasks found'
              : `No ${filters.status} tasks`}
          </h3>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            {searchQuery || hasActiveFilters
              ? 'Try adjusting your search or filters to find what you\'re looking for'
              : filters.status === 'open'
              ? 'Create your first task to start earning XP!'
              : `You don't have any ${filters.status} tasks yet`}
          </p>
          {!searchQuery && !hasActiveFilters && filters.status === 'open' && (
            <Button onClick={onCreateTask} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Button>
          )}
          {(searchQuery || hasActiveFilters) && (
            <Button onClick={onCreateTask} variant="outline" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
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

