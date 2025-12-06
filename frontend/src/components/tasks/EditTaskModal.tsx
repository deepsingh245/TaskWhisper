import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { updateTask } from "@/store/thunks/taskThunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TaskPriority, TaskStatus } from "@/store/types";
import { successToast, dangerToast } from "@/shared/toast";
import { closeEditModal } from "@/store/slices/uiSlice";

const EditTaskModal = () => {
    const dispatch = useAppDispatch();
    const { isEditModalOpen, editingTask } = useAppSelector((state) => state.ui);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<Date | undefined>();
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDateOpen, setIsDateOpen] = useState(false);

    // Load task when opening modal
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description);
            setDate(editingTask.due_date ? new Date(editingTask.due_date) : undefined);
            setPriority(editingTask.priority);
            setStatus(editingTask.status);
        }
    }, [editingTask]);

    const handleClose = useCallback(() => {
        setIsDateOpen(false);
        dispatch(closeEditModal());
    }, [dispatch]);

    const handleSave = async () => {
        if (!editingTask) return;

        if (!title || !priority || !status) {
            dangerToast("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await dispatch(
                updateTask({
                    id: editingTask.id,
                    data: {
                        title,
                        description,
                        priority,
                        status,
                        due_date: date ?? null,
                        updated_at: new Date().toISOString(),
                    },
                })
            );

            if (updateTask.fulfilled.match(result)) {
                successToast("Task updated successfully");
                handleClose();
            } else {
                dangerToast(result.payload as string);
            }
        } catch (err) {
            dangerToast("Unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        Edit Task
                    </DialogTitle>
                    <DialogDescription>
                        Update the details of your task.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input
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
                                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
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

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>Due Date</Label>

                            <Popover open={isDateOpen} onOpenChange={setIsDateOpen} modal={true}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal cursor-pointer",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => {
                                            setDate(d);
                                            setIsDateOpen(false);
                                        }}
                                        initialFocus={false} // 🔥 Prevent screen freezing
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Add more details..."
                            className="min-h-[100px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditTaskModal;
