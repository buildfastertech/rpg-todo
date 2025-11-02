import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { taskService } from '@/services/task.service';
import { categoryService } from '@/services/category.service';
import { labelService } from '@/services/label.service';
import { CalendarIcon, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task, TaskPriority, Category, Label } from '@/types';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Priority is required',
  }),
  category: z.string().max(50).optional(),
  categoryIds: z.array(z.string()).max(10, 'Maximum 10 categories per task').optional(),
  labelIds: z.array(z.string()).max(20, 'Maximum 20 labels per task').optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

const priorityXP = {
  Low: 10,
  Medium: 25,
  High: 50,
  Urgent: 75,
};

export default function TaskFormDialog({ open, onOpenChange, task, onSuccess }: TaskFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
      categoryIds: [],
      labelIds: [],
    },
  });

  // Load categories and labels on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingCategories(true);
        setIsLoadingLabels(true);
        const [fetchedCategories, fetchedLabels] = await Promise.all([
          categoryService.getCategories(),
          labelService.getLabels(),
        ]);
        setCategories(fetchedCategories);
        setLabels(fetchedLabels);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingLabels(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Load task data when editing
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        priority: task.priority,
        category: task.category || '',
        categoryIds: task.categories?.map((cat) => cat.id) || [],
        labelIds: task.labels?.map((label) => label.id) || [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        dueDate: undefined,
        priority: 'Medium',
        category: '',
        categoryIds: [],
        labelIds: [],
      });
    }
  }, [task, form]);

  const selectedPriority = form.watch('priority');
  const estimatedXP = selectedPriority ? priorityXP[selectedPriority] : 25;

  const handleCreateCategory = async (name: string) => {
    try {
      const newCategory = await categoryService.createCategory({ name });
      setCategories([...categories, newCategory]);
      const currentCategoryIds = form.getValues('categoryIds') || [];
      form.setValue('categoryIds', [...currentCategoryIds, newCategory.id]);
      toast.success(`Category "${name}" created`);
    } catch (error: any) {
      console.error('Failed to create category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      // Remove from local state
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      // Remove from form if selected
      const currentCategoryIds = form.getValues('categoryIds') || [];
      if (currentCategoryIds.includes(categoryId)) {
        form.setValue('categoryIds', currentCategoryIds.filter((id) => id !== categoryId));
      }
      toast.success(`Category "${categoryName}" deleted`);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw error; // Re-throw to let the component handle the error state
    }
  };

  const handleCreateLabel = async (name: string) => {
    try {
      const newLabel = await labelService.createLabel({ name });
      setLabels([...labels, newLabel]);
      const currentLabelIds = form.getValues('labelIds') || [];
      form.setValue('labelIds', [...currentLabelIds, newLabel.id]);
      toast.success(`Label "${name}" created`);
    } catch (error: any) {
      console.error('Failed to create label:', error);
      toast.error(error.response?.data?.message || 'Failed to create label');
    }
  };

  const handleDeleteLabel = async (labelId: string, labelName: string) => {
    try {
      await labelService.deleteLabel(labelId);
      // Remove from local state
      setLabels(labels.filter((label) => label.id !== labelId));
      // Remove from form if selected
      const currentLabelIds = form.getValues('labelIds') || [];
      if (currentLabelIds.includes(labelId)) {
        form.setValue('labelIds', currentLabelIds.filter((id) => id !== labelId));
      }
      toast.success(`Label "${labelName}" deleted`);
    } catch (error: any) {
      console.error('Failed to delete label:', error);
      toast.error(error.response?.data?.message || 'Failed to delete label');
      throw error; // Re-throw to let the component handle the error state
    }
  };

  const categoryOptions: MultiSelectOption[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  const labelOptions: MultiSelectOption[] = labels.map((label) => ({
    value: label.id,
    label: label.name,
    color: label.color,
  }));

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);

    try {
      if (task) {
        // Update existing task
        await taskService.updateTask(task.id, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
          priority: data.priority,
          category: data.category,
          categoryIds: data.categoryIds,
          labelIds: data.labelIds,
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await taskService.createTask({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
          priority: data.priority,
          category: data.category,
          categoryIds: data.categoryIds,
          labelIds: data.labelIds,
        });
        toast.success('Task created successfully', {
          description: `You'll earn ${estimatedXP} XP when you complete this task!`,
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 sm:max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Update your task details below'
              : 'Fill in the details to create a new quest and earn XP'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about this task..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low (10 XP)</SelectItem>
                        <SelectItem value="Medium">Medium (25 XP)</SelectItem>
                        <SelectItem value="High">High (50 XP)</SelectItem>
                        <SelectItem value="Urgent">Urgent (75 XP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categoryOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select or create categories..."
                      emptyText="No categories found. Start typing to create one!"
                      searchPlaceholder="Search or create category..."
                      maxSelected={10}
                      onCreateNew={handleCreateCategory}
                      createNewLabel="Create category"
                      disabled={isLoadingCategories}
                      onDelete={handleDeleteCategory}
                      showDelete={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Labels */}
            <FormField
              control={form.control}
              name="labelIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labels</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={labelOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select or create labels..."
                      emptyText="No labels found. Start typing to create one!"
                      searchPlaceholder="Search or create label..."
                      maxSelected={20}
                      onCreateNew={handleCreateLabel}
                      createNewLabel="Create label"
                      disabled={isLoadingLabels}
                      onDelete={handleDeleteLabel}
                      showDelete={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t px-6 py-4 shrink-0 space-y-4">
            {/* XP Estimate */}
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Estimated Reward
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {estimatedXP} XP
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Complete this task to earn experience points!
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
  );
}