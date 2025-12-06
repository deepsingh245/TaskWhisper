import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MoreHorizontal, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Task, TaskPriority, TaskStatus } from '@/store/types';
import GlobalLoader from '@/shared/global-loader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteTask, fetchTasks, updateTask } from '@/store/thunks/taskThunks';
import { openEditModal } from '@/store/slices/uiSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


const TaskBoard = () => {
  const dispatch = useAppDispatch();
  const { list: taskList, isLoading: loading } = useAppSelector((state) => state.tasks);

  const [tasks, setTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  }>({
    todo: [],
    inProgress: [],
    done: [],
  });

  // Helper to group tasks by status into columns
  const groupTasksByStatus = (tasksArray: Task[]): { todo: Task[], inProgress: Task[], done: Task[] } => {
    const grouped: { todo: Task[], inProgress: Task[], done: Task[] } = { todo: [], inProgress: [], done: [] };
    tasksArray.forEach((task) => {
      switch (task.status) {
        case TaskStatus.TODO:
          grouped.todo.push(task);
          break;
        case TaskStatus.IN_PROGRESS:
          grouped.inProgress.push(task);
          break;
        case TaskStatus.DONE:
          grouped.done.push(task);
          break;
        default:
          // fallback to todo if unknown
          grouped.todo.push(task);
      }
    });
    return grouped;
  };

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (taskList) {
      const grouped = groupTasksByStatus(taskList);
      setTasks(grouped);
    }
  }, [taskList]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Helper to map status ID to state key
    const getColumnKey = (status: string): keyof typeof tasks | undefined => {
      if (status === TaskStatus.TODO) return 'todo';
      if (status === TaskStatus.IN_PROGRESS) return 'inProgress';
      if (status === TaskStatus.DONE) return 'done';
      return undefined;
    };

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceKey = getColumnKey(sourceStatus);
    const destKey = getColumnKey(destStatus);

    if (!sourceKey || !destKey) return;

    // If dropped in same column
    if (sourceStatus === destStatus) {
      const copiedItems = [...tasks[sourceKey]];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setTasks({
        ...tasks,
        [sourceKey]: copiedItems
      });
    } else {
      // Moving between columns
      const sourceItems = [...tasks[sourceKey]];
      const destItems = [...tasks[destKey]];
      const [removed] = sourceItems.splice(source.index, 1);

      // Update the status of the moved task locally
      const updatedTask = { ...removed, status: destStatus as TaskStatus };
      destItems.splice(destination.index, 0, updatedTask);

      setTasks({
        ...tasks,
        [sourceKey]: sourceItems,
        [destKey]: destItems
      });

      // Dispatch update to backend
      dispatch(updateTask({
        id: removed.id,
        data: { status: destStatus as TaskStatus }
      }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case TaskPriority.HIGH: return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case TaskPriority.MEDIUM: return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  const Column = ({ title, id, items }: { title: string, id: string, items: Task[] }) => (
    <div className="flex flex-col h-full min-w-[300px] bg-muted/30 rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {title}
          <span className="bg-muted text-foreground px-2 py-0.5 rounded-full text-xs">{items.length}</span>
        </h3>
      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 flex flex-col gap-3 min-h-[100px]"
          >
            {items.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`cursor-grab active:cursor-grabbing rounded-md border-none bg-white dark:bg-blue-950/20 shadow-sm hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary/20 rotate-2' : ''
                      }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="font-normal text-xs opacity-70">
                          {task.tag}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger className='p-1 cursor-pointer hover:bg-accent/100 rounded-sm'>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // Delay opening to ensure dropdown closes and doesn't conflict with body interaction locks
                              setTimeout(() => dispatch(openEditModal(task)), 0);
                            }}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setDeleteTaskId(task.id);
                              setAlert(true);
                            }} className="text-red-500">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                        <Badge className={`text-[10px] px-1.5 py-0 border-none ${getPriorityColor(task.priority)}`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  const deleteTaskHandler = () => {
    dispatch(deleteTask(deleteTaskId));
    setDeleteTaskId('');
    setAlert(false);
  };

  const [alert, setAlert] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState('');

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <GlobalLoader show={loading} />
      <div className="h-full overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          <Column title="To Do" id={TaskStatus.TODO} items={tasks.todo} />
          <Column title="In Progress" id={TaskStatus.IN_PROGRESS} items={tasks.inProgress} />
          <Column title="Done" id={TaskStatus.DONE} items={tasks.done} />
        </div>
      </div>
      <AlertDialog open={alert} onOpenChange={setAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this task from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTaskHandler}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
};

export default TaskBoard;
