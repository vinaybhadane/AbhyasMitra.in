'use client';

import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface MathInputPanelProps {
  onInsert: (latex: string, block: boolean) => void;
  onClose: () => void;
}

const SNIPPETS = {
  'Fractions': [
    { label: 'Simple fraction', latex: '\\frac{a}{b}' },
    { label: 'Nested fraction', latex: '\\frac{\\frac{a}{b}}{c}' },
    { label: 'Partial derivative', latex: '\\frac{\\partial f}{\\partial x}' },
  ],
  'Powers & Roots': [
    { label: 'Superscript', latex: 'x^{n}' },
    { label: 'Subscript', latex: 'x_{i}' },
    { label: 'Square root', latex: '\\sqrt{x}' },
    { label: 'Nth root', latex: '\\sqrt[n]{x}' },
    { label: 'Both', latex: 'x_{i}^{2}' },
  ],
  'Integrals': [
    { label: 'Definite integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
    { label: 'Indefinite integral', latex: '\\int f(x)\\,dx' },
    { label: 'Double integral', latex: '\\iint_{D} f(x,y)\\,dA' },
    { label: 'Surface integral', latex: '\\oint_{C} \\vec{F}\\cdot d\\vec{r}' },
  ],
  'Summations': [
    { label: 'Summation', latex: '\\sum_{i=1}^{n} a_i' },
    { label: 'Product', latex: '\\prod_{i=1}^{n} a_i' },
    { label: 'Limit', latex: '\\lim_{x \\to \\infty} f(x)' },
    { label: 'Infinity', latex: '\\infty' },
  ],
  'Greek Symbols': [
    { label: 'Alpha β', latex: '\\alpha,\\, \\beta,\\, \\gamma' },
    { label: 'Delta Σ', latex: '\\Delta,\\, \\Sigma,\\, \\Omega' },
    { label: 'Pi λ', latex: '\\pi,\\, \\lambda,\\, \\mu' },
    { label: 'Epsilon θ', latex: '\\epsilon,\\, \\theta,\\, \\phi' },
  ],
  'Matrices': [
    { label: '2×2 matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: '3×3 matrix', latex: '\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}' },
    { label: 'Determinant', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
  ],
  'Science & Engineering': [
    { label: 'Energy (Einstein)', latex: 'E = mc^2' },
    { label: "Maxwell's eq", latex: '\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}' },
    { label: 'Ohm\'s law', latex: 'V = IR' },
    { label: 'Euler formula', latex: 'e^{i\\pi} + 1 = 0' },
    { label: "Newton's 2nd", latex: 'F = ma' },
    { label: 'Sensitivity', latex: 'S = \\frac{\\Delta\\text{Output}}{\\Delta\\text{Input}}' },
    { label: 'Fourier', latex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}\\,dt' },
  ],
} as const;

export default function MathInputPanel({ onInsert, onClose }: MathInputPanelProps) {
  const [latex, setLatex] = useState('');
  const [isBlock, setIsBlock] = useState(false);
  const [preview, setPreview] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('Science & Engineering');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Live preview
  useEffect(() => {
    if (!latex.trim()) {
      setPreview('');
      setPreviewError(false);
      return;
    }
    try {
      const rendered = katex.renderToString(latex.trim(), {
        throwOnError: true,
        displayMode: isBlock,
        output: 'html',
        trust: false,
      });
      setPreview(rendered);
      setPreviewError(false);
    } catch (err: unknown) {
      setPreviewError(true);
      setPreview((err as Error).message || 'Invalid LaTeX');
    }
  }, [latex, isBlock]);

  const handleInsert = () => {
    if (!latex.trim()) return;
    onInsert(latex.trim(), isBlock);
    onClose();
  };

  const handleSnippet = (snippetLatex: string) => {
    setLatex(snippetLatex);
    setIsBlock(snippetLatex.includes('\\begin{') || snippetLatex.includes('\\int') || snippetLatex.includes('\\sum') || snippetLatex.includes('\\frac{\\partial'));
    textareaRef.current?.focus();
  };

  return (
    <div className="border-b border-indigo-200 dark:border-indigo-800 bg-gradient-to-b from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100 dark:border-indigo-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">∑</span>
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Insert Math Formula</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
          title="Close math panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Display mode:</span>
          <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setIsBlock(false)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                !isBlock ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Inline $…$
            </button>
            <button
              type="button"
              onClick={() => setIsBlock(true)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isBlock ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Block $$…$$
            </button>
          </div>
        </div>

        {/* LaTeX input */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            LaTeX Expression
          </label>
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleInsert();
              }
              if (e.key === 'Escape') onClose();
            }}
            placeholder={isBlock
              ? '\\frac{\\Delta\\text{Output}}{\\Delta\\text{Input}}'
              : 'E = mc^2'
            }
            rows={3}
            className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">Tip: Ctrl+Enter to insert</p>
        </div>

        {/* Live Preview */}
        {latex.trim() && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Preview</p>
            {previewError ? (
              <p className="text-xs text-red-500 font-mono break-all">{preview}</p>
            ) : (
              <div
                className={isBlock ? 'text-center' : 'inline'}
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            )}
          </div>
        )}

        {/* Insert button */}
        <button
          type="button"
          onClick={handleInsert}
          disabled={!latex.trim() || previewError}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Insert Formula
        </button>

        {/* Snippet library */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Formula Library</p>
          {Object.entries(SNIPPETS).map(([section, items]) => (
            <div key={section} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === section ? null : section)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {section}
                {openSection === section
                  ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                }
              </button>
              {openSection === section && (
                <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSnippet(item.latex)}
                      className="px-2.5 py-1 text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
