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

  /**
   * @param {string} path
   * @param {object} options fetch options, cộng thêm `label` mô tả bước đang làm
   *   để thông báo lỗi nói rõ hỏng ở đâu.
   */
  async request(path, options = {}) {
    const { label, ...init } = options;
    let response;
    try {
      response = await fetch(path.startsWith("http") ? path : `${this.base}${path}`, {
        ...init,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new GitHubError("Không kết nối được tới GitHub. Kiểm tra mạng rồi thử lại.", 0);
    }

    if (response.status === 204) return null;

    const payload = await response.json().catch(() => null);
    if (response.ok) return payload;

    throw new GitHubError(this.explain(response.status, payload, label), response.status);
  }

  /**
   * Gợi ý cách sửa, LUÔN kèm nguyên văn lý do GitHub trả về và bước bị hỏng —
   * không có hai thứ đó thì không đoán nổi đang vướng gì.
   */
  explain(status, payload, label) {
    const detail = payload?.message || "";
    const buoc = label ? ` (bước: ${label})` : "";
    const goc = detail ? ` GitHub nói: "${detail}".` : "";

    if (status === 401) {
      return `Token không hợp lệ hoặc đã hết hạn — hãy tạo token mới.${goc}${buoc}`;
    }
    if (status === 403 && /rate limit/i.test(detail)) {
      return `GitHub tạm chặn vì gọi quá nhiều. Đợi vài phút rồi thử lại.${buoc}`;
    }
    if (status === 403 && /SAML|SSO/i.test(detail)) {
      return `Token chưa được duyệt SSO cho tổ chức sở hữu kho. Vào trang token trên GitHub bấm "Authorize".${goc}${buoc}`;
    }
    if (status === 403) {
      return `GitHub từ chối (403).${goc}${buoc} ` +
        `Thường là do token thiếu quyền: token fine-grained cần "Repository permissions → Contents: Read and write", ` +
        `token classic cần scope "repo".`;
    }
    if (status === 404) {
      return `Không thấy ${this.owner}/${this.repo} nhánh ${this.branch}.${buoc} ` +
        `Với token fine-grained, GitHub trả 404 cả khi kho có thật nhưng token KHÔNG được cấp quyền vào kho đó — ` +
        `kiểm tra mục "Repository access" của token đã chọn đúng kho này chưa, và tên kho/nhánh có gõ đúng không.${goc}`;
    }
    if (status === 409) return `Kho vừa có commit mới từ nơi khác. Tải lại trang rồi đăng lại.${goc}`;
    if (status === 422) return `GitHub từ chối dữ liệu.${goc}${buoc}`;
    return `GitHub trả lỗi ${status}.${goc}${buoc}`;
  }

  /**
   * Xác thực token và kiểm tra quyền ghi. Ném lỗi nếu không đủ quyền.
   *
   * Thứ tự có chủ ý: kiểm KHO trước, vì đó mới là thứ quyết định đăng bài được
   * hay không. Việc đọc hồ sơ người dùng chỉ để hiện "@tên" nên nếu token
   * không được cấp quyền đọc hồ sơ thì bỏ qua, không chặn đăng nhập.
   */
  async verify() {
    const repo = await this.request("", { label: `đọc kho ${this.owner}/${this.repo}` });

    if (!repo.permissions?.push) {
      throw new GitHubError(
        `Token đọc được ${this.owner}/${this.repo} nhưng KHÔNG có quyền ghi. ` +
        `Với token fine-grained, vào trang token trên GitHub và đặt ` +
        `"Repository permissions → Contents" thành "Read and write" (đang là chỉ-đọc). ` +
        `Với token classic thì cần scope "repo".`, 403);
    }

    await this.request(`/branches/${encodeURIComponent(this.branch)}`,
      { label: `đọc nhánh ${this.branch}` });

    let user = {};
    try {
      user = await this.request(`${GITHUB_API}/user`, { label: "đọc hồ sơ người dùng" });
    } catch {
      user = {}; // không bắt buộc — chỉ dùng để hiển thị tên
    }
    return { login: user.login || "?", avatar: user.avatar_url, name: user.name };
  }

  /** Nội dung một file dạng chuỗi, hoặc null nếu chưa có. */
  async readFile(path) {
    try {
      const res = await this.request(
        `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(this.branch)}`,
        { label: `đọc file ${path}` });
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
        `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(this.branch)}`,
        { label: `liệt kê thư mục ${path}` });
      return items.filter((i) => i.type === "dir").map((i) => i.name).sort();
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  /** SHA commit ở đầu một nhánh. */
  async headSha(branch = this.branch) {
    const ref = await this.request(`/git/ref/heads/${encodeURIComponent(branch)}`,
      { label: `đọc đầu nhánh ${branch}` });
    return ref.object.sha;
  }

  /** Tạo nhánh mới trỏ vào cùng commit với nhánh gốc. */
  async createBranch(name, fromBranch = this.branch) {
    const sha = await this.headSha(fromBranch);
    await this.request("/git/refs", {
      method: "POST", label: `tạo nhánh ${name}`,
      body: JSON.stringify({ ref: `refs/heads/${name}`, sha }),
    });
    return name;
  }

  async deleteBranch(name) {
    await this.request(`/git/refs/heads/${encodeURIComponent(name)}`,
      { method: "DELETE", label: `xoá nhánh ${name}` });
  }

  /**
   * Ghi nhiều file trong một commit duy nhất.
   * @param {{path: string, content?: string, remove?: boolean}[]} files
   *   `remove: true` để xoá file khỏi cây.
   * @param {string} message
   * @param {string} [branch] nhánh đích, mặc định là nhánh đang cấu hình
   * @returns {Promise<{sha: string, url: string}>}
   */
  async commitFiles(files, message, branch = this.branch) {
    if (!files.length) throw new GitHubError("Không có file nào để commit.", 0);

    const baseCommitSha = await this.headSha(branch);
    const baseCommit = await this.request(`/git/commits/${baseCommitSha}`, { label: "đọc commit gốc" });

    // Base64 của UTF-8 — btoa một mình sẽ nghẹn ở ký tự tiếng Việt.
    const toBase64 = (text) => {
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    };

    // File bị xoá không cần blob — trong cây nó là một entry có sha null.
    const blobs = await Promise.all(files.map((file) => file.remove
      ? Promise.resolve(null)
      : this.request("/git/blobs", {
          method: "POST", label: `tạo blob ${file.path}`,
          body: JSON.stringify({ content: toBase64(file.content), encoding: "base64" }),
        })));

    const tree = await this.request("/git/trees", {
      method: "POST", label: "dựng cây thư mục",
      body: JSON.stringify({
        base_tree: baseCommit.tree.sha,
        tree: files.map((file, i) => file.remove
          ? { path: file.path, mode: "100644", type: "blob", sha: null }
          : { path: file.path, mode: "100644", type: "blob", sha: blobs[i].sha }),
      }),
    });

    const commit = await this.request("/git/commits", {
      method: "POST", label: "tạo commit",
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
    });

    await this.request(`/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: "PATCH", label: `đẩy nhánh ${branch}`,
      body: JSON.stringify({ sha: commit.sha }),
    });

    return { sha: commit.sha, url: commit.html_url };
  }

  /* ------------------------------------------------------- pull request */

  /** Mở PR từ `head` vào nhánh chính. */
  async createPullRequest({ head, title, body }) {
    return this.request("/pulls", {
      method: "POST", label: "mở pull request",
      body: JSON.stringify({ title, body, head, base: this.branch }),
    });
  }

  /**
   * Gán người review cho một PR. Chính GitHub sẽ gửi email
   * "X requested your review" — không cần dựng hạ tầng gửi thư nào.
   *
   * Người được gán phải có quyền truy cập kho, và KHÔNG được là tác giả PR
   * (GitHub trả 422 vì không ai tự review PR của mình).
   */
  async requestReviewers(pullNumber, reviewers) {
    return this.request(`/pulls/${pullNumber}/requested_reviewers`, {
      method: "POST", label: "gán người review",
      body: JSON.stringify({ reviewers }),
    });
  }

  /**
   * PR đang mở do trang admin tạo, nhận diện bằng tiền tố nhánh.
   * @returns {Promise<Array<{number, title, html_url, head: {ref}}>>}
   */
  async listOpenPullRequests(branchPrefix) {
    const pulls = await this.request(
      `/pulls?state=open&per_page=100&base=${encodeURIComponent(this.branch)}`,
      { label: "đọc danh sách pull request" });
    return pulls.filter((p) => p.head?.ref?.startsWith(branchPrefix));
  }

  /** Các file một PR đụng tới, kèm trạng thái added/modified/removed. */
  async pullRequestFiles(number) {
    const files = await this.request(`/pulls/${number}/files?per_page=100`,
      { label: `đọc file của PR #${number}` });
    return files.map((f) => ({ path: f.filename, status: f.status }));
  }

  /** Toàn bộ file .md trong content/ trên một nhánh, đọc bằng một lần gọi. */
  async listContentFiles(branch = this.branch) {
    const sha = await this.headSha(branch);
    const tree = await this.request(`/git/trees/${sha}?recursive=1`,
      { label: "đọc cây thư mục" });
    if (tree.truncated) {
      throw new GitHubError(
        "Kho quá lớn nên GitHub cắt bớt cây thư mục — danh sách bài có thể thiếu.", 0);
    }
    return tree.tree
      .filter((t) => t.type === "blob" && t.path.startsWith("content/"))
      .map((t) => t.path);
  }
}
