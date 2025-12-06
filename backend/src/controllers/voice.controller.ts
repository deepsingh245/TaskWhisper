import { Request, Response } from "express";
import multer from "multer";
import { transcribeBuffer } from "../utils/deepgramClient";
import parseTask from "../utils/parseTask";

const upload = multer({ storage: multer.memoryStorage() });

export const voiceTaskHandler = [
  upload.single("audio"),

  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      const mimetype = req.file.mimetype || "audio/webm";
      const buffer = req.file.buffer;

      // 1. Transcribe audio using Deepgram
      const transcript = await transcribeBuffer(buffer, mimetype);

      // 2. Parse transcript → title, priority, date, status
      const parsed = parseTask(transcript);

      // 3. Ensure consistent return format
      return res.status(200).json({
        transcript,
        title: parsed.title || "Untitled Task",
        priority: parsed.priority || "Medium",
        dueDate: parsed.dueDate || null,
        status: parsed.status || "To Do",
        description: parsed.description || "",
      });
    } catch (err: any) {
      console.error("voice-task error:", err);
      return res.status(500).json({
        error: err.message || "Failed to process voice task",
      });
    }
  },
];
