import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mic, Calendar as CalendarIcon, Check, Loader2, Play, Pause, RefreshCw, ChevronDownIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask } from '@/store/thunks/taskThunks';
import { useAppDispatch } from '@/store/hooks';
import { TaskPriority, TaskStatus } from '@/store/types';
import { v4 as uuidv4 } from 'uuid';
import { successToast, dangerToast } from '@/shared/toast';
import { uploadVoiceTaskFn } from '@/lib/voicetask';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewTaskModal = ({ open, onOpenChange }: NewTaskModalProps) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'manual' | 'voice'>('manual');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [tag, setTag] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));

  const chunksRef = useRef<Blob[]>([]);
  const resetState = () => {
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setParsedData(null);
    setTitle('');
    setPriority(TaskPriority.MEDIUM);
    setDate(undefined);
    setStatus(TaskStatus.TODO);
    setDescription('');
    setTag('');
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const startSilenceDetection = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    source.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength) as Uint8Array;

    const SILENCE_THRESHOLD = 15; // lower = more sensitive
    const MAX_SILENCE_TIME = 2500; // 2.5 sec silence triggers stop

    const checkSilence = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current! as Uint8Array<ArrayBuffer>);

      // Calculate volume
      const avg = dataArrayRef.current!.reduce((a, b) => a + b, 0) / dataArrayRef.current!.length;

      const isSilent = avg < SILENCE_THRESHOLD;

      if (!isSilent) {
        // speaking → reset timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      } else {
        // silent → start timer
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopRecording(); // auto stop
          }, MAX_SILENCE_TIME);
        }
      }

      requestAnimationFrame(checkSilence);
    };

    checkSilence();
  };


  const handleSave = async () => {
    const uuid = uuidv4();
    if (!title || !description || !priority || !date || !status) {
      dangerToast('Please fill all fields');
      return;
    }
    const resultAction = await dispatch(createTask({
      id: uuid,
      title,
      description,
      priority,
      due_date: date,
      tag: tag || 'General',
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: uuid,
    }));

    if (createTask.fulfilled.match(resultAction)) {
      successToast('Task created successfully');
      onOpenChange(false);
      resetState();
    } else {
      dangerToast((resultAction.payload as string) || 'Failed to create task');
    }
  };

  const handleStartListening = async () => {
    try {
      if (isListening) {
        stopRecording();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // START SILENCE DETECTION
      startSilenceDetection(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // stop silence detection
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (audioContextRef.current) audioContextRef.current.close();

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsProcessing(true);

        const data = await uploadVoiceTask(blob);

        setTranscript(data.transcript);
        setParsedData(data);
        setTitle(data.title);
        setDescription(data.description);
        setPriority(data.priority.toLowerCase());
        setPriority(data.priority.toLowerCase());
        setDate(data.dueDate ? new Date(data.dueDate) : undefined);
        setTag(data.tag);

        setIsProcessing(false);
        setIsListening(false);

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsListening(true);
      setIsProcessing(false);

    } catch (err) {
      console.error("Mic error:", err);
      dangerToast("Microphone permission is required.");
    }
  };


  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };


  const uploadVoiceTask = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await uploadVoiceTaskFn(audioBlob);

      if (!response.success) throw new Error("No response received");

      return {
        transcript: response.data.transcript || "",
        title: response.data.title || "",
        priority: response.data.priority || "medium",
        dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
        status: response.data.status || "to-do",
        description: response.data.description || "",
        tag: response.data.tag || "General",
      };
    } catch (error: any) {
      console.error("Voice task upload error:", error);
      dangerToast("Voice processing failed.");
      return {
        transcript: "",
        title: "",
        priority: "medium",
        dueDate: undefined,
        status: "to-do",
        description: "",
        tag: "General",
      };
    }
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

        <Tabs defaultValue={activeTab} className="w-full">
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

          {/* Manual Tab */}
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
              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>Low Priority</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium Priority</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High Priority</SelectItem>
                    <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tag */}
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  placeholder="e.g., Work, Personal"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>

              {/* Due Date*/}
              <div className="space-y-2">
                <Label>Due Date</Label>

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        setIsOpen(false);
                      }}
                      initialFocus={false}
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

          {/* Voice Tab */}
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
                      "h-24 w-24 rounded-full shadow-2xl transition-all duration-300 relative z-10 cursor-pointer hover:scale-110",
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
                    <div className="grid grid-cols-2 gap-6">
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Priority</Label>
                        <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                            <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Tag</Label>
                        <Input value={tag} onChange={(e) => setTag(e.target.value)} />
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
                            <Calendar mode="single" selected={date} onSelect={setDate} />
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
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
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
