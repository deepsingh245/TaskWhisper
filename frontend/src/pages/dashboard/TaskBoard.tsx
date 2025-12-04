import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MoreHorizontal, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock Data
const initialTasks = {
  todo: [
    { id: 't1', title: 'Research competitors', priority: 'high', date: 'Tomorrow', tag: 'Strategy' },
    { id: 't2', title: 'Draft user stories', priority: 'medium', date: 'Dec 12', tag: 'Product' },
  ],
  inProgress: [
    { id: 't3', title: 'Design system updates', priority: 'critical', date: 'Today', tag: 'Design' },
  ],
  done: [
    { id: 't4', title: 'Setup project repo', priority: 'low', date: 'Dec 01', tag: 'Dev' },
  ]
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // If dropped in same column
    if (source.droppableId === destination.droppableId) {
      const column = source.droppableId as keyof typeof tasks;
      const copiedItems = [...tasks[column]];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [column]: copiedItems
      });
    } else {
      // Moving between columns
      const sourceColumn = source.droppableId as keyof typeof tasks;
      const destColumn = destination.droppableId as keyof typeof tasks;
      const sourceItems = [...tasks[sourceColumn]];
      const destItems = [...tasks[destColumn]];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [sourceColumn]: sourceItems,
        [destColumn]: destItems
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
    }
  };

  const Column = ({ title, id, items }: { title: string, id: string, items: any[] }) => (
    <div className="flex flex-col h-full min-w-[300px] bg-muted/30 rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {title}
          <span className="bg-muted text-foreground px-2 py-0.5 rounded-full text-xs">{items.length}</span>
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
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
                    className={`cursor-grab active:cursor-grabbing rounded-md border-none shadow-sm hover:shadow-md transition-all ${
                      snapshot.isDragging ? 'shadow-xl ring-2 ring-primary/20 rotate-2' : ''
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="font-normal text-xs opacity-70">
                          {task.tag}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                              <MoreHorizontal className="h-3 w-3" />
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
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
                            {task.date}
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          <Column title="To Do" id="todo" items={tasks.todo} />
          <Column title="In Progress" id="inProgress" items={tasks.inProgress} />
          <Column title="Done" id="done" items={tasks.done} />
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
