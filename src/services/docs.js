import frontmatterModule from '../../assets/js/frontmatter.js';

const docModules = import.meta.glob('../generated/docs/*.json');

export const parseFrontmatter =
  frontmatterModule.parseFrontmatter ||
  frontmatterModule.default?.parseFrontmatter ||
  frontmatterModule;

export const stringifyFrontmatter =
  frontmatterModule.stringifyFrontmatter ||
  frontmatterModule.default?.stringifyFrontmatter;

/**
 * Tải dữ liệu bài viết từ generated/docs/ (chứa nội dung markdown body đã parse).
 * Hỗ trợ fallback từ fetch nếu chạy qua static hosting.
 */
export async function fetchDocData(contentFile) {
  if (!contentFile) return null;
  const path = `../generated/docs/${contentFile}.json`;
  if (docModules[path]) {
    const mod = await docModules[path]();
    return mod.default || mod;
  }
  try {
    const res = await fetch(`/generated/docs/${contentFile}.json`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return null;
}
