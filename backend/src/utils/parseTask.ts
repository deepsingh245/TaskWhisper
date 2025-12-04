import * as chrono from 'chrono-node';
import nlp from 'compromise';

interface ParsedTask {
    title: string;
    dueDate: string | null;
    priority: 'High' | 'Medium' | 'Low';
    status: 'To Do' | 'In Progress' | 'Done';
}

/**
 * Simple parsing logic to extract:
 *  - title
 *  - dueDate (ISO string or null)
 *  - priority (High / Medium / Low)
 *  - status (To Do / In Progress / Done)
 *
 * Input: transcript string
 */
export default function parseTask(transcript: string): ParsedTask {
    const text = (transcript || '').trim();

    // 1) Extract date using chrono-node
    const parsedDates = chrono.parse(text);
    let dueDate: string | null = null;
    if (parsedDates && parsedDates.length > 0) {
        try {
            const dt = parsedDates[0].start.date();
            dueDate = dt.toISOString();
        } catch (e) {
            dueDate = null;
        }
    }

    // 2) Priority detection (simple keyword rules)
    const textLower = text.toLowerCase();
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    if (/\b(urgent|asap|critical|high priority|high-priority|high priority)\b/.test(textLower)) {
        priority = 'High';
    } else if (/\b(low priority|low-priority|low)\b/.test(textLower)) {
        priority = 'Low';
    }

    // 3) Status detection (if user mentions)
    let status: 'To Do' | 'In Progress' | 'Done' = 'To Do';
    if (/\b(in progress|doing|started|ongoing)\b/.test(textLower)) status = 'In Progress';
    if (/\b(done|completed|finish(ed)?)\b/.test(textLower)) status = 'Done';

    // 4) Title extraction using compromise
    // Remove common filler verbs and date expressions for cleaner title.
    let title = extractTitle(text);

    return {
        title,
        dueDate,
        priority,
        status
    };
}

/**
 * Extract a concise title:
 * - Remove leading verbs like "create", "remind me to", "set a task to"
 * - Try to remove date phrases (using chrono's text removal)
 * - If still long, return first clause/sentence.
 */
function extractTitle(text: string): string {
    if (!text) return '';

    // Remove common starter phrases
    let cleaned = text
        .replace(/^(create( a)?( new)? (task|todo|reminder) to )/i, '')
        .replace(/^(create( a)? (task|todo|reminder) to )/i, '')
        .replace(/^(remind me to )/i, '')
        .replace(/^(remind me that )/i, '')
        .replace(/^(please )/i, '')
        .replace(/\b(on|by|before|due|at|tomorrow|today|next)\b.*$/i, '') // strip trailing date phrases simplistically
        .trim();

    // Use compromise to get imperative or noun phrases
    const doc = nlp(cleaned);
    // prefer the verb phrase + object or the sentence trimmed
    let candidate = doc.sentences().first().out('text') || cleaned;

    // If candidate still contains priority words or status, remove them
    candidate = candidate.replace(/\b(high priority|low priority|urgent|critical)\b/gi, '');
    // Trim punctuation and whitespace
    candidate = candidate.replace(/^[\.,\s]+|[\.,\s]+$/g, '').trim();

    // Fallback: return the first 6-10 words if it's very long
    if (candidate.split(/\s+/).length > 12) {
        candidate = candidate.split(/\s+/).slice(0, 10).join(' ') + '...';
    }

    return candidate;
}
