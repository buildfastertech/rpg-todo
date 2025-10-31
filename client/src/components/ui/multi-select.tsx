import * as React from 'react';
import { X, Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  maxSelected?: number;
  onCreateNew?: (value: string) => void;
  createNewLabel?: string;
  disabled?: boolean;
  onDelete?: (value: string, label: string) => Promise<void>;
  showDelete?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  emptyText = 'No items found.',
  searchPlaceholder = 'Search...',
  maxSelected,
  onCreateNew,
  createNewLabel = 'Create',
  disabled = false,
  onDelete,
  showDelete = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ value: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      if (maxSelected && selected.length >= maxSelected) {
        return;
      }
      onChange([...selected, value]);
    }
    // Keep the popover open for multi-select
    // setOpen(false); // Uncomment this if you want to close after each selection
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleCreateNew = () => {
    if (searchValue.trim() && onCreateNew) {
      onCreateNew(searchValue.trim());
      setSearchValue('');
      // Keep popover open to allow selecting the newly created item
    }
  };

  const handleDeleteClick = (value: string, label: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete({ value, label });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(itemToDelete.value, itemToDelete.label);
        // Remove from selected if it was selected
        if (selected.includes(itemToDelete.value)) {
          onChange(selected.filter((item) => item !== itemToDelete.value));
        }
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateNew =
    onCreateNew &&
    searchValue.trim() &&
    !options.some((opt) => opt.label.toLowerCase() === searchValue.toLowerCase());

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            selectedOptions.length === 0 && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              placeholder
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 3).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="gap-1"
                    style={
                      option.color
                        ? {
                            backgroundColor: `${option.color}20`,
                            borderColor: option.color,
                            color: option.color,
                          }
                        : undefined
                    }
                  >
                    {option.label}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRemove(option.value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge variant="secondary" className="gap-1">
                    +{selectedOptions.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false} loop>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && searchValue.trim() && (
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">{emptyText}</p>
                {showCreateNew && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={handleCreateNew}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createNewLabel} "{searchValue}"
                  </Button>
                )}
              </div>
            )}
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                        'transition-colors group'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 flex-shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {option.color && (
                          <div
                            className="h-3 w-3 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        <span className="flex-1 truncate">{option.label}</span>
                      </div>
                      {showDelete && onDelete && (
                        <button
                          className={cn(
                            'ml-2 flex-shrink-0 rounded p-1 hover:bg-destructive/10 hover:text-destructive transition-colors',
                            'opacity-0 group-hover:opacity-100'
                          )}
                          onClick={(e) => handleDeleteClick(option.value, option.label, e)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {showCreateNew && (
                  <div
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateNew();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>{createNewLabel} "{searchValue}"</span>
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{itemToDelete?.label}"? This will remove it from all
            tasks that use this category. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

