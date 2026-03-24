import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INPUT_DIR = path.join(rootDir, 'public/data/enriched');
const OUTPUT_DIR = path.join(rootDir, 'public/data/questions');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeMcqFromVocab(word, definition, allWords) {
  const distractors = allWords
    .filter(w => w.word !== word)
    .map(w => w.definition)
    .slice(0, 3);
  while (distractors.length < 3) {
    distractors.push('None of the above');
  }
  const options = shuffle([definition, ...distractors.slice(0, 3)]);
  return {
    type: 'mcq',
    question: 'What does "' + word + '" mean?',
    options,
    correct_answer: definition,
    explanation: '"' + word + '" means: ' + definition,
  };
}

function makeFillBlank(keyPoint) {
  // Find a meaningful noun/key phrase to blank out (longest single word > 4 chars)
  const words = keyPoint.split(' ').filter(w => w.replace(/[^a-zA-Z]/g, '').length > 4);
  if (words.length === 0) return null;
  const target = words[Math.floor(words.length / 2)]; // pick a middle word
  const cleanTarget = target.replace(/[^a-zA-Z]/g, '');
  const blanked = keyPoint.replace(target, '______');
  return {
    type: 'fill_blank',
    question: 'Fill in the blank: ' + blanked,
    options: null,
    correct_answer: cleanTarget.toLowerCase(),
    explanation: 'The full sentence is: "' + keyPoint + '"',
  };
}

function makeMcqFromKeyPoint(keyPoint, allKeyPoints) {
  const distractors = allKeyPoints
    .filter(k => k !== keyPoint)
    .slice(0, 3);
  while (distractors.length < 3) distractors.push('It has no special meaning in writing.');
  const options = shuffle([keyPoint, ...distractors.slice(0, 3)]);
  // Turn key point into a question form
  const questionText = 'Which of the following is TRUE about this topic?';
  return {
    type: 'mcq',
    question: questionText,
    options,
    correct_answer: keyPoint,
    explanation: 'Correct! "' + keyPoint + '" is one of the key things to remember.',
  };
}

let count = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'));
  const questions = [];
  const vocab = data.vocabulary || [];
  const keyPoints = data.key_points || [];

  // Q1: MCQ from first vocab word (if available)
  if (vocab.length >= 1) {
    questions.push(makeMcqFromVocab(vocab[0].word, vocab[0].definition, vocab));
  }

  // Q2: MCQ from second vocab word (if available) 
  if (vocab.length >= 2) {
    questions.push(makeMcqFromVocab(vocab[1].word, vocab[1].definition, vocab));
  }

  // Q3: Fill in the blank from first key point (if available)
  if (keyPoints.length >= 1) {
    const fb = makeFillBlank(keyPoints[0]);
    if (fb) questions.push(fb);
  }

  // Q4: True-or-false MCQ from a key point
  if (keyPoints.length >= 2) {
    questions.push(makeMcqFromKeyPoint(keyPoints[1], keyPoints));
  }

  // Q5: MCQ from third vocab word (if available), else another key point MCQ
  if (vocab.length >= 3) {
    questions.push(makeMcqFromVocab(vocab[2].word, vocab[2].definition, vocab));
  } else if (keyPoints.length >= 3) {
    questions.push(makeMcqFromKeyPoint(keyPoints[2], keyPoints));
  }

  // Trim to max 5
  const finalQuestions = questions.slice(0, 5);

  if (finalQuestions.length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, file),
      JSON.stringify({ topic: data.topic, title: data.title, questions: finalQuestions }, null, 2)
    );
    count++;
  }
}

console.log('Generated questions for ' + count + ' pages in /public/data/questions/');
