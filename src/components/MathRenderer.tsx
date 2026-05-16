'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  /** Raw HTML string containing math expressions */
  html: string;
  className?: string;
}

/**
 * Renders HTML content with KaTeX math formula support.
 *
 * Supports:
 *   - Inline math wrapped in <span class="math-inline">LATEX</span>
 *   - Block math wrapped in <div class="math-block">LATEX</div>
 *   - Inline $...$ delimiters inside text nodes
 *   - Block $$...$$ delimiters inside text nodes
 */
export default function MathRenderer({ html, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Render pre-tagged math-inline spans ──────────────────────────────
    container.querySelectorAll<HTMLElement>('.math-inline').forEach((el) => {
      const latex = el.getAttribute('data-latex') || el.textContent || '';
      try {
        el.innerHTML = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
          trust: false,
        });
      } catch {
        el.classList.add('katex-error');
        el.textContent = latex;
      }
    });

    // ── 2. Render pre-tagged math-block divs ────────────────────────────────
    container.querySelectorAll<HTMLElement>('.math-block').forEach((el) => {
      const latex = el.getAttribute('data-latex') || el.textContent || '';
      try {
        el.innerHTML = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          output: 'html',
          trust: false,
        });
      } catch {
        el.classList.add('katex-error');
        el.textContent = latex;
      }
    });

    // ── 3. Walk text nodes for $...$ and $$...$$ delimiters ─────────────────
    renderMathInTextNodes(container);
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Walks all text nodes in the container and replaces:
 *   $$...$$  →  <div class="math-block"> rendered KaTeX </div>
 *   $...$    →  <span class="math-inline"> rendered KaTeX </span>
 *
 * Skips nodes already inside .math-inline/.math-block to avoid double processing,
 * and skips <code>/<pre> blocks to preserve code formatting.
 */
function renderMathInTextNodes(container: HTMLElement): void {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

  // Collect all text nodes that might contain math
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Skip if inside a skip tag
      let parent = node.parentElement;
      while (parent && parent !== container) {
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.classList.contains('math-inline') || parent.classList.contains('math-block')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.classList.contains('katex') || parent.classList.contains('katex-display')) {
          return NodeFilter.FILTER_REJECT;
        }
        parent = parent.parentElement;
      }
      // Only process if the text contains $ sign
      return (node.textContent?.includes('$') ?? false)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }

  // Process each text node
  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    if (!text.includes('$')) continue;

    const fragment = parseAndRenderMath(text);
    if (fragment) {
      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  }
}

/**
 * Parses a text string for $$...$$ and $...$ patterns and returns a
 * DocumentFragment with rendered KaTeX nodes, or null if no math found.
 */
function parseAndRenderMath(text: string): DocumentFragment | null {
  // Regex: match $$...$$ first (greedy would be wrong, use lazy)
  const pattern = /(\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$)/g;
  const parts: (string | { latex: string; block: boolean })[] = [];

  let last = 0;
  let match: RegExpExecArray | null;
  let hasMath = false;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    const raw = match[0];
    if (raw.startsWith('$$')) {
      parts.push({ latex: raw.slice(2, -2).trim(), block: true });
      hasMath = true;
    } else {
      parts.push({ latex: raw.slice(1, -1).trim(), block: false });
      hasMath = true;
    }
    last = match.index + raw.length;
  }

  if (!hasMath) return null;

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  const fragment = document.createDocumentFragment();
  for (const part of parts) {
    if (typeof part === 'string') {
      fragment.appendChild(document.createTextNode(part));
    } else {
      const el = document.createElement(part.block ? 'div' : 'span');
      el.className = part.block ? 'math-block' : 'math-inline';
      try {
        el.innerHTML = katex.renderToString(part.latex, {
          throwOnError: false,
          displayMode: part.block,
          output: 'html',
          trust: false,
        });
      } catch {
        el.classList.add('katex-error');
        el.textContent = part.latex;
      }
      fragment.appendChild(el);
    }
  }

  return fragment;
}
