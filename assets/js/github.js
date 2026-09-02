"use strict";
// Client GitHub API tối thiểu cho trang admin.
//
// Dùng Git Data API (blob → tree → commit → ref) thay vì Contents API để mọi
// file của một lần đăng bài nằm gọn trong MỘT commit: lịch sử sạch, và Vercel
// chỉ build một lần thay vì ba.

const GITHUB_API = "https://api.github.com";

class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
  }
}

class GitHubRepo {
  /** @param {{token: string, owner: string, repo: string, branch: string}} config */
  constructor(config) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch;
  }

  get base() {
    return `${GITHUB_API}/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}`;
  }

  async request(path, options = {}) {
    let response;
    try {
      response = await fetch(path.startsWith("http") ? path : `${this.base}${path}`, {
        ...options,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      });
    } catch {
      throw new GitHubError("Không kết nối được tới GitHub. Kiểm tra mạng rồi thử lại.", 0);
    }

    if (response.status === 204) return null;

    const payload = await response.json().catch(() => null);
    if (response.ok) return payload;

    throw new GitHubError(this.explain(response.status, payload), response.status);
  }

  explain(status, payload) {
    const detail = payload?.message || "";
    if (status === 401) return "Token không hợp lệ hoặc đã hết hạn. Hãy tạo token mới.";
    if (status === 403 && /rate limit/i.test(detail)) return "GitHub tạm chặn vì gọi quá nhiều. Đợi vài phút rồi thử lại.";
    if (status === 403) return "Token không đủ quyền. Cần quyền Contents: Read and write cho kho này.";
    if (status === 404) return `Không thấy ${this.owner}/${this.repo} (nhánh ${this.branch}). Kiểm tra lại tên kho, nhánh, và quyền của token.`;
    if (status === 409) return "Kho vừa có commit mới từ nơi khác. Tải lại trang rồi đăng lại.";
    if (status === 422) return `GitHub từ chối dữ liệu: ${detail}`;
    return `GitHub trả lỗi ${status}${detail ? `: ${detail}` : ""}`;
  }

  /** Xác thực token và kiểm tra quyền ghi. Ném lỗi nếu không đủ quyền. */
  async verify() {
    const user = await this.request(`${GITHUB_API}/user`);
    const repo = await this.request("");
    if (!repo.permissions?.push) {
      throw new GitHubError(`Tài khoản @${user.login} không có quyền ghi vào ${this.owner}/${this.repo}.`, 403);
    }
    await this.request(`/branches/${encodeURIComponent(this.branch)}`);
    return { login: user.login, avatar: user.avatar_url, name: user.name };
  }

  /** Nội dung một file dạng chuỗi, hoặc null nếu chưa có. */
  async readFile(path) {
    try {
      const res = await this.request(
        `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(this.branch)}`);
      // atob trả chuỗi byte; đổi sang UTF-8 để không vỡ tiếng Việt.
      const bytes = Uint8Array.from(atob(res.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  /** Danh sách thư mục con trực tiếp của một đường dẫn (rỗng nếu chưa có). */
  async listDirs(path) {
    try {
      const items = await this.request(
        `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(this.branch)}`);
      return items.filter((i) => i.type === "dir").map((i) => i.name).sort();
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  /**
   * Ghi nhiều file trong một commit duy nhất.
   * @param {{path: string, content: string}[]} files
   * @returns {Promise<{sha: string, url: string}>}
   */
  async commitFiles(files, message) {
    if (!files.length) throw new GitHubError("Không có file nào để commit.", 0);

    const ref = await this.request(`/git/ref/heads/${encodeURIComponent(this.branch)}`);
    const baseCommitSha = ref.object.sha;
    const baseCommit = await this.request(`/git/commits/${baseCommitSha}`);

    // Base64 của UTF-8 — btoa một mình sẽ nghẹn ở ký tự tiếng Việt.
    const toBase64 = (text) => {
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    };

    const blobs = await Promise.all(files.map((file) =>
      this.request("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: toBase64(file.content), encoding: "base64" }),
      })));

    const tree = await this.request("/git/trees", {
      method: "POST",
      body: JSON.stringify({
        base_tree: baseCommit.tree.sha,
        tree: files.map((file, i) => ({
          path: file.path, mode: "100644", type: "blob", sha: blobs[i].sha,
        })),
      }),
    });

    const commit = await this.request("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
    });

    await this.request(`/git/refs/heads/${encodeURIComponent(this.branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha }),
    });

    return { sha: commit.sha, url: commit.html_url };
  }
}
