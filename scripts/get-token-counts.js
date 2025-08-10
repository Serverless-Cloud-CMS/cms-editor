// This script will help us get the actual token counts from the implementation
// We'll run this script and use the output to update our test file

// Import the Utils class
const { Utils } = require('../src/helpers/Utils.js');

// Define the test cases
const testCases = [
  { name: 'Empty string', text: '' },
  { name: 'Whitespace-only', text: '   ' },
  { name: 'Short words', text: 'the cat sat' },
  { name: 'Medium word', text: 'computer' },
  { name: 'Medium + short', text: 'computer network' },
  { name: 'Long word', text: 'internationalization' },
  { name: 'With punctuation', text: 'hello!' },
  { name: 'With punctuation and space', text: 'hello, world!' },
  { name: 'Mixed sentence', text: 'The quick brown fox jumps over the lazy dog.' },
  { name: 'Very short words', text: 'I am' },
  { name: 'Complex text', text: 'AI models like GPT-3.5 use tokenization to process text. The estimateTokenCount() method provides an approximation!' }
];

// Get the token counts
console.log('Actual token counts from the implementation:');
console.log('===========================================');
for (const testCase of testCases) {
  try {
    const tokenCount = Utils.estimateTokenCount(testCase.text);
    console.log(`${testCase.name}: ${tokenCount} tokens for "${testCase.text}"`);
  } catch (error) {
    console.error(`Error for ${testCase.name}: ${error.message}`);
  }
}