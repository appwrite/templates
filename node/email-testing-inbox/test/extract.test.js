import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractCode } from '../src/extract.js';

test('prefers the code over another number in the subject', () => {
  assert.equal(
    extractCode('Order 55123: verify your email', 'Your code is 482913.'),
    '482913'
  );
});

test('prefers the code over a number between it and the code wording', () => {
  const text = 'Verify your account\nAccount 55123\nYour code: 482913';
  assert.equal(extractCode('Welcome', text), '482913');
});

test('prefers 6 digits over another length on the same line', () => {
  const text = 'Your security code for account 55123 is 482913.';
  assert.equal(extractCode('Sign in', text), '482913');
});

test('keeps a shorter code that follows the code wording', () => {
  const text = 'Your login code: 48291\nQuestions? Call 555123.';
  assert.equal(extractCode('Sign in', text), '48291');
});

test('finds a code on its own line under the wording', () => {
  const text =
    'Hi Ana,\nYour verification code is:\n\n4 8 2 9 1 3\n\nOrder 55123';
  assert.equal(extractCode('Welcome', text), '482913');
});

test('finds a mixed code', () => {
  assert.equal(
    extractCode('Your code', 'Enter K7Q-2XM to continue.'),
    'K7Q-2XM'
  );
});

test('skips years, prices and percentages', () => {
  const text = 'Save 15% on $12,500 in 2026. Your code is 482913.';
  assert.equal(extractCode('Confirm your email', text), '482913');
});

test('finds nothing without code wording', () => {
  assert.equal(
    extractCode('Your order shipped', 'Order 482913 ships today.'),
    null
  );
});
