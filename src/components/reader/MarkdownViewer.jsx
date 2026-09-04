import { useEffect, useRef } from 'react';
import { showToast } from '../common/Toast';

export function MarkdownViewer({ html, isDark }) {
  const containerRef = useRef(null);

  // Nút "Sao chép" đã nằm sẵn trong header mỗi khối mã do renderMarkdown sinh
  // ra (data-copy-code) — chỉ cần gắn hành vi. Trước đây effect bên dưới còn
  // chèn thêm một nút thứ hai vào <pre>, nên khối mã nào cũng có hai nút.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onCopyClick = (event) => {
      const button = event.target.closest('[data-copy-code]');
      if (!button || !container.contains(button)) return;
      event.preventDefault();

      const block = button.closest('.code-block-wrapper, .mermaid-block-wrapper');
      const source = block?.querySelector('code, pre.mermaid');
      const text = source?.innerText ?? '';
      if (!text) return;

      const label = button.querySelector('.copy-label');
      navigator.clipboard.writeText(text).then(
        () => {
          button.classList.add('copied');
          if (label) label.textContent = 'Đã chép!';
          showToast('✓ Đã sao chép đoạn mã!');
          setTimeout(() => {
            button.classList.remove('copied');
            if (label) label.textContent = 'Sao chép';
          }, 2000);
        },
        () => showToast('Không thể sao chép vào bộ nhớ tạm')
      );
    };

    container.addEventListener('click', onCopyClick);
    return () => container.removeEventListener('click', onCopyClick);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
  }, [html, isDark]);

  const htmlContent = html || '';

  return (
    // markdown-body + reader-content-card là hai lớp mang toàn bộ typography và
    // nền/padding của khung đọc trong assets/css — thiếu chúng thì chữ chạy sát
    // mép nền, không còn thẻ nội dung.
    <article
      ref={containerRef}
      id="reader-body"
      className="reader-body reader-content-card markdown-body max-w-none transition-colors"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
