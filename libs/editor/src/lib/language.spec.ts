import { describe, it, expect } from 'vitest';
import { getMonacoLanguage } from './language.js';

describe('getMonacoLanguage', () => {
  it('maps JavaScript files', () => {
    expect(getMonacoLanguage('app.js')).toBe('javascript');
    expect(getMonacoLanguage('Component.jsx')).toBe('javascript');
  });

  it('maps TypeScript files', () => {
    expect(getMonacoLanguage('app.ts')).toBe('typescript');
    expect(getMonacoLanguage('Component.tsx')).toBe('typescript');
  });

  it('maps Python files', () => {
    expect(getMonacoLanguage('main.py')).toBe('python');
  });

  it('maps HTML/CSS files', () => {
    expect(getMonacoLanguage('index.html')).toBe('html');
    expect(getMonacoLanguage('styles.css')).toBe('css');
  });

  it('maps JSON files', () => {
    expect(getMonacoLanguage('package.json')).toBe('json');
  });

  it('returns plaintext for unknown extensions', () => {
    expect(getMonacoLanguage('readme.unknown')).toBe('plaintext');
  });

  it('returns plaintext for files without extension', () => {
    expect(getMonacoLanguage('Dockerfile')).toBe('plaintext');
  });
});
