import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { PDFDocument } from 'pdf-lib';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment or .env file.');
  console.error('Please define GEMINI_API_KEY in praxis-learn/.env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite", generationConfig: { responseMimeType: "application/json" } });

const PDF_PATH = path.resolve(rootDir, '../847802875-Cambridge-Primary-English-2ED-Learner-s-Book-6.pdf');
const OUTPUT_DIR = path.join(rootDir, 'public/data/pages');
const PROGRESS_FILE = path.join(rootDir, 'scripts/progress.json');
const INDEX_FILE = path.join(rootDir, 'public/data/index.json');
const TEMP_BATCH_DIR = path.join(rootDir, 'scripts/temp');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(path.dirname(PROGRESS_FILE))) fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  if (!fs.existsSync(TEMP_BATCH_DIR)) fs.mkdirSync(TEMP_BATCH_DIR, { recursive: true });
}

async function getTotalPages(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
}

const aiPrompt = `
You are a Cambridge Primary English teacher.
Analyze this textbook PDF (which contains a batch of up to 5 consecutive pages) and extract the learning content for EACH page.
The audience is an 11-year-old child. 

Rules FOR EACH PAGE:
1. REWRITE the content. Do NOT copy raw textbook tone.
2. Break explanations into short chunks (max 3-4 sentences each) with simple language.
3. Include at least 1 relatable example for concepts.
4. Extract key points and vocabulary.
5. Create an "explain_again" field containing an ultra-simple, alternative explanation of this page (like talking to a smart 8-year-old).
6. Try to infer the 'term', 'unit' and 'topic' from the page or context.

Provide the result as a strict JSON array containing exactly one object per page in the PDF document:
[
  {
    "page_index_in_batch": 1,
    "term": "Term Name or Number (e.g. Term 1)",
    "unit": "Unit Name or Number",
    "topic": "Topic Name",
    "title": "Page Title or Concept",
    "explanation_chunks": ["Chunk 1...", "Chunk 2..."],
    "examples": ["Example 1..."],
    "key_points": ["Point 1...", "Point 2..."],
    "vocabulary": [{"word": "bolded_word", "definition": "simple meaning"}],
    "explain_again": "Ultra-simple alternative explanation...",
    "fun_analogy": "A fun short analogy explaining the concept"
  }
]
`;

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { total_pages: 0, processed_pages: [], failed_pages: [], completed: false };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function updateIndexFile(pageData, pageNumber) {
    let indexData = [];
    if (fs.existsSync(INDEX_FILE)) {
        try { indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8')); } catch(e) {}
    }
    
    // Check if page already in index, if so replace
    const existingIndex = indexData.findIndex(p => p.pageNumber === pageNumber);
    const entry = {
        pageNumber,
        term: pageData.term || "Unknown Term",
        unit: pageData.unit || "Unknown Unit",
        topic: pageData.topic || "Unknown Topic",
        title: pageData.title || `Page ${pageNumber}`
    };

    if (existingIndex >= 0) {
        indexData[existingIndex] = entry;
    } else {
        indexData.push(entry);
    }

    // Sort index
    indexData.sort((a,b) => a.pageNumber - b.pageNumber);
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));
}

async function processBatch(pageNumbers, totalPages, sourcePdfDoc) {
    console.log(`Processing batch of pages: ${pageNumbers.join(', ')} / ${totalPages}...`);
    
    // Create tiny PDF for batch
    const batchPdf = await PDFDocument.create();
    // pdf-lib page indices are 0-based
    const copiedPages = await batchPdf.copyPages(sourcePdfDoc, pageNumbers.map(p => p - 1));
    for (const page of copiedPages) {
        batchPdf.addPage(page);
    }
    const batchBytes = await batchPdf.save();
    const tempPath = path.join(TEMP_BATCH_DIR, `batch_${pageNumbers[0]}_to_${pageNumbers[pageNumbers.length-1]}.pdf`);
    fs.writeFileSync(tempPath, batchBytes);

    console.log(`Uploading batch PDF to Gemini...`);
    const uploadResult = await fileManager.uploadFile(tempPath, {
        mimeType: "application/pdf",
        displayName: `batch_${pageNumbers[0]}`,
    });

    console.log(`Calling Gemini API for batch...`);
    const attempt = await model.generateContent([
        aiPrompt,
        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType
            }
        }
    ]);

    const textRes = attempt.response.text();
    let jsonArray;
    try {
        jsonArray = JSON.parse(textRes.trim().replace(/^```json/, '').replace(/```$/, ''));
    } catch (e) {
        console.error(`Error parsing JSON for batch ${pageNumbers}:`, textRes);
        throw new Error("Failed to parse Gemini response as JSON array");
    }

    if (!Array.isArray(jsonArray)) {
        throw new Error("Gemini response is not a JSON array.");
    }

    // Process and Save JSON per page
    for (let i = 0; i < jsonArray.length; i++) {
        const pageData = jsonArray[i];
        // match array index to requested pageNumber roughly
        const pageNum = pageNumbers[i] || pageNumbers[0];
        const outputFilename = path.join(OUTPUT_DIR, `page_${pageNum}.json`);
        fs.writeFileSync(outputFilename, JSON.stringify(pageData, null, 2));
        updateIndexFile(pageData, pageNum);
        console.log(`Completed process on batch ${pageNumbers[0]} to ${pageNumbers[pageNumbers.length-1]} successfully`);
    }

    try { fs.unlinkSync(tempPath); } catch(e) {}
}

async function main() {
    ensureDirs();
    let progress = loadProgress();

    if (progress.completed) {
        console.log("All pages already processed. Exiting.");
        return;
    }

    if (!fs.existsSync(PDF_PATH)) {
        console.error(`PDF not found at: ${PDF_PATH}`);
        process.exit(1);
    }

    console.log(`Loading source PDF into memory...`);
    const pdfBytes = fs.readFileSync(PDF_PATH);
    const sourcePdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const totalPages = sourcePdfDoc.getPageCount();
    console.log(`Total pages detected in PDF: ${totalPages}`);
    
    progress.total_pages = totalPages;
    saveProgress(progress);

    const batchSize = 5;
    let hasMore = true;

    while (hasMore) {
        progress = loadProgress();
        const pendingPages = [];
        
        for (let i = 1; i <= totalPages; i++) {
            if (!progress.processed_pages.includes(i)) {
                pendingPages.push(i);
            }
        }

        if (pendingPages.length === 0) {
            console.log("100% of pages successfully processed!");
            progress.completed = true;
            saveProgress(progress);
            hasMore = false;
            break;
        }

        const batch = pendingPages.slice(0, batchSize);
        console.log(`Starting batch processing for pages: ${batch.join(', ')}`);

        let retryCount = 0;
        let success = false;
        
        while (retryCount < 3 && !success) {
            try {
                for (let p of batch) console.log(`Processing page ${p}/${totalPages}`);
                
                await processBatch(batch, totalPages, sourcePdfDoc);
                
                for(const pageNum of batch) {
                    if (!progress.processed_pages.includes(pageNum)) {
                        progress.processed_pages.push(pageNum);
                    }
                    progress.failed_pages = progress.failed_pages.filter(p => p !== pageNum);
                    console.log(`Completed page ${pageNum}`);
                }
                saveProgress(progress);
                success = true;
                
                // Simple delay to avoid rate limits on Gemini
                await new Promise(r => setTimeout(r, 4000));
            } catch (error) {
                retryCount++;
                console.error(`[ERROR] Failed to process batch ${batch.join(', ')} on attempt ${retryCount}/3: `, error.message);
                try { fs.writeFileSync('error_dump.log', error.stack || error.message); } catch(e) {}
                if (retryCount >= 3) {
                    for(const pageNum of batch) {
                         if (!progress.failed_pages.includes(pageNum)) progress.failed_pages.push(pageNum);
                    }
                    saveProgress(progress);
                    console.error("Batch completely failed after 3 retries. Stopping pipeline.");
                    process.exit(1); // Do not finish, let the user know.
                }
                console.log("Saving state and pausing before next retry in the loop...");
                await new Promise(r => setTimeout(r, 10000)); // sleep 10s on error to cool down
            }
        }
    }
}

main().catch(console.error);
