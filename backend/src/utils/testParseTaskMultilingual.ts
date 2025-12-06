import parseTask from './parseTask';

const testCases = [
    { text: "Create a high priority task to buy milk tomorrow", lang: "en", expected: { tag: "general", priority: "High" } },
    { text: "Crear una tarea urgente para comprar leche mañana", lang: "es", expected: { tag: "general", priority: "High" } }, // Spanish
    { text: "Créer une tâche urgente pour acheter du lait demain", lang: "fr", expected: { tag: "general", priority: "High" } }, // French
    { text: "Eine wichtige Aufgabe erstellen Milch kaufen", lang: "de", expected: { tag: "general", priority: "High" } }, // German
    // Add more cases for status, tags, etc.
];

async function runTests() {
    console.log("Running Multilingual Parsing Tests...\n");
    for (const test of testCases) {
        console.log(`Input [${test.lang}]: "${test.text}"`);
        const result = parseTask(test.text, test.lang);
        console.log("Parsed:", JSON.stringify(result, null, 2));
        console.log("---------------------------------------------------");
    }
}

runTests();
