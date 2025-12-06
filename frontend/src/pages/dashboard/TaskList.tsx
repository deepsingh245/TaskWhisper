import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, ArrowUpDown, Calendar, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskPriority, TaskStatus } from '@/store/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteTask, fetchTasks } from '@/store/thunks/taskThunks';
import { openEditModal } from '@/store/slices/uiSlice';
import GlobalLoader from '@/shared/global-loader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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


const TaskList = () => {
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState('');
  const { list: tasks, isLoading: loading } = useAppSelector((state) => {
    return state.tasks;
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case TaskPriority.HIGH: return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case TaskPriority.MEDIUM: return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-green-500/10 text-green-500';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const deleteTaskHandler = () => {
    dispatch(deleteTask(deleteTaskId));
    setDeleteTaskId('');
    setAlert(false);
  };

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <GlobalLoader show={loading} />
        <CardHeader className="px-0 pt-0">
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent">
                      Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.tag}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`font-normal ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0.5 border-none ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className='p-2 cursor-pointer'>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            // Delay opening to ensure dropdown closes and doesn't conflict with body interaction locks
                            setTimeout(() => dispatch(openEditModal(task)), 0);
                          }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => { setAlert(true); setDeleteTaskId(task.id) }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={alert} onOpenChange={setAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTaskHandler}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskList;
