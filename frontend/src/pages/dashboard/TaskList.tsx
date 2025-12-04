import React from 'react';
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

const tasks = [
  { id: 't1', title: 'Research competitors', priority: 'high', date: 'Tomorrow', status: 'To Do', tag: 'Strategy' },
  { id: 't2', title: 'Draft user stories', priority: 'medium', date: 'Dec 12', status: 'To Do', tag: 'Product' },
  { id: 't3', title: 'Design system updates', priority: 'critical', date: 'Today', status: 'In Progress', tag: 'Design' },
  { id: 't4', title: 'Setup project repo', priority: 'low', date: 'Dec 01', status: 'Done', tag: 'Dev' },
  { id: 't5', title: 'Client meeting', priority: 'high', date: 'Dec 15', status: 'To Do', tag: 'Sales' },
];

const TaskList = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500/10 text-green-500';
      case 'In Progress': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
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
                      {task.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
