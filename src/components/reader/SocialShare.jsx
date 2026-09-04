import React, { useState } from 'react';
import { showToast } from '../common/Toast';

export function SocialShare({ doc, variant = 'card' }) {
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const getShareUrl = () => {
    if (typeof window !== 'undefined' && window.location.href) {
      return window.location.href;
    }
    return '';
  };

  const shareTitle = doc.title ? `${doc.title} | Blog Tech` : 'Blog Tech';
  const shareSummary = doc.description || doc.subtitle || shareTitle;

  const openShareWindow = (url) => {
    const width = 600;
    const height = 550;
    const left = typeof window !== 'undefined' ? (window.innerWidth - width) / 2 : 100;
    const top = typeof window !== 'undefined' ? (window.innerHeight - height) / 2 : 100;
    window.open(
      url,
      'share-dialog',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast('🔗 Đã sao chép liên kết bài viết!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Không thể sao chép liên kết');
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      id: 'facebook',
      name: 'Facebook',
      bgHover: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
        openShareWindow(url);
      },
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      bgHover: 'hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 hover:border-slate-900 dark:hover:border-white',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareTitle)}`;
        openShareWindow(url);
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      bgHover: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
        openShareWindow(url);
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      bgHover: 'hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(shareTitle)}`;
        openShareWindow(url);
      },
    },
    {
      id: 'zalo',
      name: 'Zalo',
      bgHover: 'hover:bg-[#0068FF] hover:text-white hover:border-[#0068FF]',
      icon: (
        <span className="font-black text-[11px] leading-none tracking-tighter">Zalo</span>
      ),
      action: () => {
        const url = `https://sp.zalo.me/share_inline?url=${encodeURIComponent(getShareUrl())}`;
        openShareWindow(url);
      },
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap" title="Chia sẻ bài viết">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">
          Chia sẻ:
        </span>
        {shareChannels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={c.action}
            title={`Chia sẻ lên ${c.name}`}
            className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-600/50 transition-all cursor-pointer"
          >
            {c.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCopyLink}
          title={copied ? 'Đã sao chép link!' : 'Sao chép liên kết'}
          className={`h-7 px-2.5 inline-flex items-center gap-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/60 dark:border-slate-600/50'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Đã chép</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>Link</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <section className="social-share-card my-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 m-0">
            <span>📢</span>
            <span>Chia sẻ bài viết</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">
            Thấy bài viết hữu ích? Hãy lan toả kiến thức đến bạn bè và cộng đồng!
          </p>
        </div>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shrink-0"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Thiết bị...</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {shareChannels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={c.action}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${c.bgHover}`}
          >
            {c.icon}
            <span>{c.name}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-2xs hover:shadow-xs transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-600'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>✓ Đã sao chép link</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>Sao chép liên kết</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
