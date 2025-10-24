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
import { taskService } from '@/services/task.service';
import { CalendarIcon, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task, TaskPriority } from '@/types';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dueDate: z.date({ required_error: 'Due date is required' }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Priority is required',
  }),
  category: z.string().max(50).optional(),
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
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
    },
  });

  // Load task data when editing
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        dueDate: new Date(task.dueDate),
        priority: task.priority,
        category: task.category || '',
      });
      setLabels(task.labels || []);
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
      });
      setLabels([]);
    }
  }, [task, form]);

  const selectedPriority = form.watch('priority');
  const estimatedXP = selectedPriority ? priorityXP[selectedPriority] : 25;

  const handleAddLabel = () => {
    const trimmedLabel = labelInput.trim();
    if (trimmedLabel && !labels.includes(trimmedLabel)) {
      setLabels([...labels, trimmedLabel]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label !== labelToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);

    try {
      if (task) {
        // Update existing task
        await taskService.updateTask(task.id, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate.toISOString(),
          priority: data.priority,
          category: data.category,
        });
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await taskService.createTask({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate.toISOString(),
          priority: data.priority,
          category: data.category,
          labels: labels.length > 0 ? labels : undefined,
        });
        toast.success('Task created successfully', {
          description: `You'll earn ${estimatedXP} XP when you complete this task!`,
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
      setLabels([]);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Update your task details below'
              : 'Fill in the details to create a new quest and earn XP'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Work, Personal, Health..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Labels */}
            {!task && (
              <div className="space-y-2">
                <FormLabel>Custom Labels</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a label..."
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={handleAddLabel}>
                    Add
                  </Button>
                </div>
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      >
                        {label}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-purple-900 dark:hover:text-purple-300"
                          onClick={() => handleRemoveLabel(label)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* XP Estimate */}
            <div className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Estimated Reward
                  </span>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

