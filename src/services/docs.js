// assets/js/frontmatter.js là UMD dùng chung với build (Node `require`): trong
// trình duyệt nó gán API vào globalThis chứ không có export ESM nào. Import lấy
// side effect rồi đọc từ globalThis — `import ... from` sẽ ném lỗi "does not
// provide an export named 'default'" và làm hỏng cả trang.
import '../../assets/js/frontmatter.js';

const docModules = import.meta.glob('../generated/docs/*.json');

export const parseFrontmatter = globalThis.parseFrontmatter;

export const stringifyFrontmatter = globalThis.stringifyFrontmatter;

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
