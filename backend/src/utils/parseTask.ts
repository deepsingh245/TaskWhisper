import * as chrono from 'chrono-node';
import nlp from 'compromise';

interface ParsedTask {
    title: string;
    dueDate: string | null;
    priority: 'High' | 'Medium' | 'Low';
    status: 'To Do' | 'In Progress' | 'Done';
    description: string;
    tag: string;
}

const VALID_TAGS = ['work', 'home', 'life', 'kitchen', 'school', 'office', 'personal', 'health', 'finance', 'waiting', 'errand',
    'trabajo', 'casa', 'vida', 'cocina', 'escuela', 'oficina', 'salud', 'finanzas', // ES
    'travail', 'maison', 'vie', 'cuisine', 'école', 'bureau', 'santé', 'banque', // FR
    'arbeit', 'zuhause', 'leben', 'küche', 'schule', 'büro', 'gesundheit', 'finanzen', // DE
    'kaam', 'ghar', 'naji', 'rasoi', 'school', 'office', 'sehat', 'paisa' // HI (transliterated roughly or mixed)
];

const KEYWORD_MAP: Record<string, {
    priority: { high: RegExp, low: RegExp },
    status: { inProgress: RegExp, done: RegExp }
}> = {
    en: {
        priority: {
            high: /\b(urgent|asap|critical|high priority|high-priority|important)\b/i,
            low: /\b(low priority|low-priority|low|unimportant|not that important)\b/i
        },
        status: {
            inProgress: /\b(in progress|doing|started|ongoing)\b/i,
            done: /\b(done|completed|finish(ed)?)\b/i
        }
    },
    es: {
        priority: {
            high: /\b(urgente|asap|crítico|alta prioridad|importante)\b/i,
            low: /\b(baja prioridad|no importante|poco importante)\b/i
        },
        status: {
            inProgress: /\b(en progreso|haciendo|empezado|en curso)\b/i,
            done: /\b(hecho|completado|terminado|finalizado)\b/i
        }
    },
    fr: {
        priority: {
            high: /\b(urgente?|asap|critique|haute priorité|importante?)\b/i,
            low: /\b(basse priorité|pas importante?|peu importante?)\b/i
        },
        status: {
            inProgress: /\b(en cours|en train de|commencé)\b/i,
            done: /\b(fait|terminé|complet|fini)\b/i
        }
    },
    de: {
        priority: {
            high: /\b(dringend|asap|kritisch|hohe priorität|wichtig(e|er|es)?)\b/i,
            low: /\b(niedrige priorität|unwichtig(e|er|es)?|nicht wichtig(e|er|es)?)\b/i
        },
        status: {
            inProgress: /\b(in bearbeitung|dabei|begonnen|laufend)\b/i,
            done: /\b(erledigt|fertig|abgeschlossen|beendet)\b/i
        }
    },
    hi: {
        priority: {
            high: /\b(jaruri|zaroori|urgent|important|mahatvapurn)\b/i,
            low: /\b(kam jaruri|kam zaroori|unimportant)\b/i
        },
        status: {
            inProgress: /\b(chal raha hai|shuru|doing)\b/i,
            done: /\b(ho gaya|khatam|pura|complete)\b/i
        }
    }
};

export default function parseTask(transcript: string, language: string = 'en'): ParsedTask {
    const text = (transcript || '').trim();
    const langCode = KEYWORD_MAP[language] ? language : 'en';
    const keywords = KEYWORD_MAP[langCode];

    // 1) Extract date using chrono-node based on language
    let parsedDates;
    if (langCode === 'es') parsedDates = chrono.es.parse(text);
    else if (langCode === 'fr') parsedDates = chrono.fr.parse(text);
    else if (langCode === 'de') parsedDates = chrono.de.parse(text);
    // chrono doesn't support Hindi natively, fallback to strictly english or maybe loose parsing
    else parsedDates = chrono.parse(text);

    let dueDate: string | null = null;
    if (parsedDates && parsedDates.length > 0) {
        try {
            const dt = parsedDates[0].start.date();
            dueDate = dt.toISOString();
        } catch (e) {
            dueDate = null;
        }
    }

    // 2) Priority detection
    const textLower = text.toLowerCase();
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    if (keywords.priority.high.test(textLower)) {
        priority = 'High';
    } else if (keywords.priority.low.test(textLower)) {
        priority = 'Low';
    }

    // 3) Status detection
    let status: 'To Do' | 'In Progress' | 'Done' = 'To Do';
    if (keywords.status.inProgress.test(textLower)) status = 'In Progress';
    if (keywords.status.done.test(textLower)) status = 'Done';

    // 4) Tag detection
    let tag = 'general';
    for (const t of VALID_TAGS) {
        if (new RegExp(`\\b${t}\\b`, 'i').test(textLower)) {
            tag = t;
            // Map translated tags back to English canonical if needed, or keep as is.
            // For now, let's keep them as detected or do a simple mapping if strictly required.
            // To keep it simple, we return the detected word.
            break;
        }
    }

    // 5) Title extraction & Description
    let title = extractTitle(text, langCode);
    let description = removeCommandPrefix(text, langCode);

    return {
        title,
        dueDate,
        priority,
        status,
        description,
        tag
    };
}

function removeCommandPrefix(text: string, lang: string): string {
    // Basic prefix removal - could be expanded per language
    let cleaned = text;
    if (lang === 'en') {
        cleaned = text
            .replace(/^(create( a)?( new)? (task|todo|reminder) to )/i, '')
            .replace(/^(remind me to )/i, '')
            .replace(/^(please )/i, '');
    } else if (lang === 'es') {
        cleaned = text
            .replace(/^(crear( una)? (nueva )?(tarea|recordatorio) (para|de) )/i, '')
            .replace(/^(recuérdame )/i, '')
            .replace(/^(por favor )/i, '');
    } else if (lang === 'fr') {
        cleaned = text
            .replace(/^(créer( une)? (nouvelle )?(tâche|rappel) (pour|de) )/i, '')
            .replace(/^(rappelle-moi de )/i, '')
            .replace(/^(s'il te plaît |stp )/i, '');
    }
    // ... add others as needed
    return cleaned.trim();
}

function extractTitle(text: string, lang: string): string {
    if (!text) return '';

    let cleaned = removeCommandPrefix(text, lang);
    
    // Strip trailing date phrases (simplistic)
    if (lang === 'en') {
        cleaned = cleaned.replace(/\b(on|by|before|due|at|tomorrow|today|next)\b.*$/i, '');
    } 
    // Add other langs...

    return cleaned.trim();
}

