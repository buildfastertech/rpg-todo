import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, MoreVertical, Pencil, Trash2, Archive, Calendar, Sparkles, Loader2 } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
  onArchive: (taskId: string) => Promise<void>;
}

const priorityColors = {
  Low: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  High: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
  Urgent: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

export default function TaskCard({ task, onComplete, onEdit, onDelete, onArchive }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'open';
  const priorityColor = priorityColors[task.priority];

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onArchive(task.id);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-green-500/10">
      {/* Priority indicator bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${priorityColor.split(' ')[0]}`} />

      <CardHeader className="pb-3 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg leading-tight text-slate-900 dark:text-white">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isCompleting || isDeleting || isArchiving}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status === 'open' && (
                <DropdownMenuItem onClick={handleComplete} disabled={isCompleting}>
                  {isCompleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(task)} disabled={isCompleting || isDeleting || isArchiving}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {task.status !== 'archived' && (
                <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                  {isArchiving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 pl-5">
        {/* Categories */}
        {task.categories && task.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="text-xs gap-1.5"
                style={{
                  backgroundColor: `${category.color}15`,
                  borderColor: category.color,
                  color: category.color,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs gap-1.5"
                style={{
                  backgroundColor: `${label.color}15`,
                  borderColor: label.color,
                  color: label.color,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Priority badge */}
          <Badge variant="outline" className={priorityColor}>
            {task.priority}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3 pl-5 bg-slate-50/50 dark:bg-neutral-900/50">
        {/* XP Value */}
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">{task.xpValue} XP</span>
        </div>

        {/* Complete button for open tasks */}
        {task.status === 'open' && (
          <Button
            size="sm"
            onClick={handleComplete}
            className="cursor-pointer"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Complete
              </>
            )}
          </Button>
        )}

        {/* Status badge for completed/archived tasks */}
        {task.status !== 'open' && (
          <Badge variant="secondary" className="capitalize">
            {task.status}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

