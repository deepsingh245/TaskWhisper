import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mic, Calendar as CalendarIcon, Check, Loader2, Play, Pause, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewTaskModal = ({ open, onOpenChange }: NewTaskModalProps) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const resetState = () => {
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setParsedData(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDate(new Date());
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const handleStartListening = () => {
    setIsListening(true);
    // Simulate listening duration
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        const mockTranscript = "Create a high priority task to review the pull request for the authentication module by tomorrow evening";
        const mockParsed = {
          title: "Review the pull request for the authentication module",
          priority: "high",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          status: "todo"
        };
        
        setTranscript(mockTranscript);
        setParsedData(mockParsed);
        
        // Auto-fill form
        setTitle(mockParsed.title);
        setPriority(mockParsed.priority);
        setDate(mockParsed.dueDate);
        
        setIsProcessing(false);
      }, 1500);
    }, 2000);
  };

  const handleSave = () => {
    onOpenChange(false);
    
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task to your board manually or using voice commands.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="voice" className="relative">
              Voice Mode
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Update landing page design" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Add more details..." 
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6 py-4">
            {!parsedData ? (
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  {isListening && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary"
                    />
                  )}
                  <Button
                    size="lg"
                    className={cn(
                      "h-24 w-24 rounded-full shadow-2xl transition-all duration-300 relative z-10",
                      isListening ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-primary to-violet-600"
                    )}
                    onClick={handleStartListening}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-10 w-10 animate-spin" />
                    ) : isListening ? (
                      <Pause className="h-10 w-10" />
                    ) : (
                      <Mic className="h-10 w-10" />
                    )}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isListening ? "Listening..." : isProcessing ? "Processing..." : "Tap to Speak"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {isListening 
                      ? "Describe your task naturally. Include title, priority, and due date." 
                      : "Example: \"Create a high priority task to review the pull request by tomorrow 6 PM\""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">Transcript</Label>
                    <Button variant="ghost" size="sm" onClick={resetState} className="h-6 text-xs">
                      <RefreshCw className="mr-1 h-3 w-3" /> Retry
                    </Button>
                  </div>
                  <p className="text-sm italic text-foreground/80">"{transcript}"</p>
                </div>

                <div className="space-y-4 border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Extracted Details</h4>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-medium">
                      High Confidence
                    </span>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-1">
                      <Label className="text-xs text-muted-foreground">Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn("w-full justify-start text-left font-normal")}
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskModal;
