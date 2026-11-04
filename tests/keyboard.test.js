import test from 'node:test';
import assert from 'node:assert/strict';
import {isInteractiveTarget} from '../src/keyboard.js';

test('Texteingaben und Bedienelemente behalten ihre Tastatureingaben', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A']) {
    assert.equal(isInteractiveTarget({tagName}), true);
  }
  assert.equal(isInteractiveTarget({tagName: 'DIV', isContentEditable: true}), true);
  assert.equal(isInteractiveTarget({tagName: 'CANVAS'}), false);
});

test('Unterelemente eines editierbaren Bereichs werden erkannt', () => {
  assert.equal(isInteractiveTarget({tagName: 'SPAN', closest: () => ({})}), true);
  assert.equal(isInteractiveTarget({tagName: 'SPAN', closest: () => null}), false);
});
