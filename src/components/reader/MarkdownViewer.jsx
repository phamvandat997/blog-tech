import { useEffect, useRef } from 'react';
import { renderMarkdown } from '../../services/markdown';
import { showToast } from '../common/Toast';

export function MarkdownViewer({ markdown, isDark }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Copy Code Buttons
    const codeBlocks = container.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return; // already added

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy-btn';
      button.innerHTML = '📋 Sao chép';
      button.title = 'Sao chép đoạn mã này';

      button.addEventListener('click', (e) => {
        e.preventDefault();
        const codeText = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(codeText).then(
          () => {
            button.innerHTML = '✓ Đã chép!';
            button.classList.add('copied');
            showToast('✓ Đã sao chép đoạn mã!');
            setTimeout(() => {
              button.innerHTML = '📋 Sao chép';
              button.classList.remove('copied');
            }, 2000);
          },
          () => showToast('Không thể sao chép vào bộ nhớ tạm')
        );
      });

      pre.style.position = 'relative';
      pre.appendChild(button);
    });

    // 2. Setup Heading Anchors
    const headings = container.querySelectorAll('h2[id], h3[id]');
    headings.forEach((heading) => {
      if (heading.querySelector('.heading-anchor-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'heading-anchor-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Sao chép liên kết mục này');
      btn.title = 'Sao chép liên kết mục này';
      btn.innerHTML = '#';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.hash = heading.id;
        history.replaceState(null, '', url.toString());
        navigator.clipboard.writeText(url.toString()).then(
          () => showToast('🔗 Đã sao chép liên kết đề mục!'),
          () => showToast('Không thể truy cập clipboard')
        );
      });
      heading.appendChild(btn);
    });

    // 3. Setup Mermaid Diagrams
    const diagrams = container.querySelectorAll('.mermaid');
    if (diagrams.length > 0) {
      const renderMermaid = () => {
        if (typeof window.mermaid !== 'undefined') {
          try {
            window.mermaid.initialize({
              startOnLoad: false,
              theme: isDark ? 'dark' : 'neutral',
              securityLevel: 'loose',
              fontFamily: 'var(--font-sans)',
              themeVariables: {
                darkMode: isDark,
                fontFamily: 'var(--font-sans)',
              },
            });
            window.mermaid.run({ nodes: diagrams });
          } catch (err) {
            console.warn('Mermaid rendering error:', err);
          }
        }
      };

      if (typeof window.mermaid === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.onload = renderMermaid;
        document.head.appendChild(script);
      } else {
        renderMermaid();
      }
    }
  }, [markdown, isDark]);

  const htmlContent = renderMarkdown(markdown || '');

  return (
    <article
      ref={containerRef}
      id="reader-body"
      className="reader-body prose prose-slate dark:prose-invert max-w-none transition-colors"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
