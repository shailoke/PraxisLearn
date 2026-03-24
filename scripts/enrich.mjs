import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INPUT_DIR = path.join(rootDir, 'public/data/pages');
const OUTPUT_DIR = path.join(rootDir, 'public/data/enriched');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
let enrichedCount = 0;

for (const file of files) {
    const rawData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'));

    // 1. Simple vs Detailed Exp
    const chunks = rawData.explanation_chunks || [];
    const simple_explanation = rawData.explain_again || (chunks.length > 0 ? chunks[0] : "Let's explore this topic!");
    
    // Detailed explanation takes the remaining chunks or the whole thing if no explain_again
    const detailed_explanation = chunks.length > 1 ? chunks.slice(1).join(" ") : chunks.join(" ");

    // 2. Examples Expanded
    const baseExamples = rawData.examples || [];
    const examples_expanded = baseExamples.map((ex, i) => {
        return {
            text: ex,
            context: `This example shows how we use the concept of ${rawData.topic.toLowerCase()} in a real sentence.`
        };
    });

    if (examples_expanded.length === 0 && rawData.fun_analogy) {
         examples_expanded.push({ text: rawData.fun_analogy, context: "An analogy to help you remember!"});
    }

    // 3. Guided Practice
    const vocab = rawData.vocabulary || [];
    let guided_practice = [];
    if (vocab.length > 0) {
        guided_practice.push(`Identify the meaning of '${vocab[0].word}' in a sentence. Remember it means: ${vocab[0].definition}`);
        if (vocab.length > 1) {
             guided_practice.push(`Match the word '${vocab[1].word}' with a similar concept from your own experience.`);
        }
    } else {
        guided_practice.push(`Review the key points and see if you can identify the main theme of ${rawData.topic}.`);
    }
    
    // Add generic modifier practice
    guided_practice.push(`Look at the first example again. How would you modify it to make it your own?`);

    // 4. Application Tasks
    const application_tasks = [
        `Create 3 of your own sentences using the core idea of ${rawData.topic}.`,
        `Imagine you are teaching this topic to a friend. Write down exactly what you would say.`
    ];

    // 5. Challenge Tasks
    const mainConcept = vocab.length > 0 ? vocab[0].word : rawData.topic;
    const challenge_tasks = [
        `Combine the concept of '${mainConcept}' with something you learned in a previous chapter to write a short paragraph.`,
        `Can you find an exception to this rule or a creative way to bend it? Explain how.`
    ];

    const enriched = {
        page_index_in_batch: rawData.page_index_in_batch,
        term: rawData.term,
        unit: rawData.unit,
        topic: rawData.topic,
        title: rawData.title,
        simple_explanation,
        detailed_explanation,
        examples_expanded,
        guided_practice,
        application_tasks,
        challenge_tasks,
        // Preserve for backward compatibility if needed in UI context
        key_points: rawData.key_points || [],
        vocabulary: rawData.vocabulary || []
    };

    fs.writeFileSync(path.join(OUTPUT_DIR, file), JSON.stringify(enriched, null, 2));
    enrichedCount++;
}

console.log(`Enrichment complete. Upgraded ${enrichedCount} files locally without external APIs.`);
