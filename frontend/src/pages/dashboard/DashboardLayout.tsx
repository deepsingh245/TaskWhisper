import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import NewTaskModal from '@/components/tasks/NewTaskModal';
import { logoutUser } from '@/store/thunks/authThunks';
import { useAppDispatch } from '@/store/hooks';
import { dangerToast } from '@/shared/toast';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import { useAppSelector } from '@/store/hooks';
import { openEditModal } from '@/store/slices/uiSlice';
import { Task } from '@/store/types';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const dispatch = useAppDispatch();
  const { list: tasks } = useAppSelector((state) => state.tasks);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchFocus = () => setShowSearchResults(true);
  const handleSearchBlur = () => {
    // Delay hiding to allow click event on result
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleTaskClick = (task: Task) => {
    dispatch(openEditModal(task));
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dangerToast('Logout failed');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-card/50 backdrop-blur-xl">
        <SidebarContent handleLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent handleLogout={handleLogout} />
              </SheetContent>
            </Sheet>
            <div className="relative hidden md:block w-96 z-50">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl overflow-hidden max-h-[300px] overflow-y-auto"
                  >
                    {filteredTasks.length > 0 ? (
                      <div className="py-2">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                            onClick={() => handleTaskClick(task)}
                          >
                            <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {task.description}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${task.priority === 'high' || task.priority === 'critical'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tasks found matching "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsNewTaskOpen(true)}
              className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary/50">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NewTaskModal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
      <EditTaskModal />
    </div>
  );
};

const SidebarContent = ({ handleLogout }: { handleLogout: () => void }) => (
  <div className="flex flex-col h-full">
    <div className="p-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
        TaskWhisper
      </h1>
    </div>
    <div className="px-3 py-2 flex-1">
      <div className="space-y-1">
        <NavLink
          to="/dashboard/board"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-all ${isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          Board View
        </NavLink>
        <NavLink
          to="/dashboard/list"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-all ${isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <ListTodo className="h-5 w-5" />
          List View
        </NavLink>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Settings
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Settings className="h-5 w-5" />
          Preferences
        </button>
      </div>
    </div>
    <div className="p-4">
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  </div>
);

export default DashboardLayout;
