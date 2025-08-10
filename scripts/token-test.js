// Simple script to test the token count calculation
const { Utils } = require('./dist/helpers/Utils');

const complexText = 'AI models like GPT-3.5 use tokenization to process text. The estimateTokenCount() method provides an approximation!';
const tokenCount = Utils.estimateTokenCount(complexText);

console.log(`Token count for complex text: ${tokenCount}`);

// Let's also test the other examples from our test file
console.log(`Empty string: ${Utils.estimateTokenCount('')}`);
console.log(`Whitespace-only: ${Utils.estimateTokenCount('   ')}`);
console.log(`Short words: ${Utils.estimateTokenCount('the cat sat')}`);
console.log(`Medium word: ${Utils.estimateTokenCount('computer')}`);
console.log(`Medium + short: ${Utils.estimateTokenCount('computer network')}`);
console.log(`Long word: ${Utils.estimateTokenCount('internationalization')}`);
console.log(`With punctuation: ${Utils.estimateTokenCount('hello!')}`);
console.log(`With punctuation and space: ${Utils.estimateTokenCount('hello, world!')}`);
console.log(`Mixed sentence: ${Utils.estimateTokenCount('The quick brown fox jumps over the lazy dog.')}`);
console.log(`Very short words: ${Utils.estimateTokenCount('I am')}`);