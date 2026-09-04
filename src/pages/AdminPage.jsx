import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitHubRepo } from '../services/github';
import { useCatalog } from '../hooks/useCatalog';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import { AdminLogin } from '../components/admin/AdminLogin';
import { PostList } from '../components/admin/PostList';
import { PostEditor } from '../components/admin/PostEditor';
import { QuizManager } from '../components/admin/QuizManager';
import { Footer } from '../components/layout/Footer';
import { Toast, showToast } from '../components/common/Toast';

const SESSION_KEY = 'blog.adminSession';
const BRANCH_PREFIX = 'post/';

/**
 * Email được phép vào màn quản lý. Để rỗng thì không chặn ai.
 *
 * VỀ BẢO MẬT: đây chỉ là rào chắn nhầm lẫn, KHÔNG phải bảo mật — mã chạy ở
 * trình duyệt nên ai xem mã nguồn cũng đọc và bỏ qua được. Thứ thật sự chặn
 * người lạ là GitHub: không có token đủ quyền đẩy vào kho thì commit bị từ chối.
 */
const ALLOWED_EMAILS = ['phamvandat0029@gmail.com'];

/**
 * Tài khoản GitHub được gán review cho mọi PR do trang này mở. Điền tên đăng
 * nhập vào đây là GitHub tự gửi email "X requested your review".
 *
 * Người được gán phải có quyền truy cập kho. Ai trùng với người đang đăng nhập
 * sẽ bị bỏ qua, vì GitHub không cho tự review PR của mình (lỗi 422).
 * Để rỗng thì không gán ai — PR vẫn mở bình thường.
 */
const REVIEWERS = [];

function branchName(action, slug) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${BRANCH_PREFIX}${action}-${slug}-${stamp}`;
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, docs } = useCatalog();

  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [view, setView] = useState(() => searchParams.get('view') || 'list');
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const gh = useMemo(() => {
    if (!session) return null;
    return new GitHubRepo({
      token: session.token,
      owner: session.owner,
      repo: session.repo,
      branch: session.branch || 'master',
    });
  }, [session]);

  // Sync view query param
  useEffect(() => {
    const v = searchParams.get('view');
    if (v && ['list', 'editor', 'quiz'].includes(v)) {
      setView(v);
    }
  }, [searchParams]);

  const changeView = (newView) => {
    setView(newView);
    if (newView === 'editor' && view !== 'editor') {
      setEditingPost(null);
    }
    setSearchParams({ view: newView });
  };

  // Load posts from GitHub and catalog
  const loadPosts = useCallback(async () => {
    if (!gh) return;
    setLoading(true);
    try {
      const contentFiles = await gh.listContentFiles();
      const openPulls = await gh.listOpenPullRequests(BRANCH_PREFIX);

      const items = contentFiles
        .filter((f) => f.endsWith('.md'))
        .map((filePath) => {
          const parts = filePath.replace(/^content\//, '').replace(/\.md$/, '').split('/');
          const [secId, catId, slug] = parts;
          const matchingDoc = docs.find((d) => d.id === `${secId}/${catId}/${slug}`);

          return {
            path: filePath,
            section: secId,
            category: catId,
            slug,
            title: matchingDoc?.title || slug,
            status: 'published',
          };
        });

      // Match pending PRs
      openPulls.forEach((pr) => {
        const prHead = pr.head.ref;
        const match = prHead.match(/^post\/(them|sua|xoa)-(.+)-\d{8}-\d{6}$/);
        if (match) {
          const [, action, prSlug] = match;
          const existing = items.find((i) => i.slug === prSlug);
          if (existing) {
            existing.status = 'pending';
            existing.pr = pr;
          } else if (action === 'them') {
            items.unshift({
              path: `content/?/?/${prSlug}.md`,
              section: '?',
              category: '?',
              slug: prSlug,
              title: pr.title,
              status: 'pending',
              pr,
            });
          }
        }
      });

      setPosts(items);
    } catch (err) {
      console.warn('Lỗi đọc kho GitHub:', err);
      // Fallback from catalog docs
      setPosts(
        docs.map((d) => ({
          path: `content/${d.section}/${d.category}/${d.slug}.md`,
          section: d.section,
          category: d.category,
          slug: d.slug,
          title: d.title,
          status: 'published',
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [gh, docs]);

  useEffect(() => {
    if (gh && view === 'list') {
      loadPosts();
    }
  }, [gh, view, loadPosts]);

  // Login handler
  const handleLogin = async ({ email, token, owner, repo, branch }) => {
    if (ALLOWED_EMAILS.length && !ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setLoginError('Email này không nằm trong danh sách được phép đăng bài.');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const client = new GitHubRepo({ token, owner, repo, branch });
      const user = await client.verify();

      const newSession = { email, token, owner, repo, branch, user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setIsGuestMode(false);
      showToast(`👋 Xin chào ${user.name || user.login}!`);
    } catch (err) {
      setLoginError(err.message || 'Lỗi đăng nhập GitHub.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setIsGuestMode(false);
    showToast('Đã đăng xuất.');
  };

  /**
   * Gán review SAU khi PR đã mở, và hỏng thì chỉ báo chứ không ném lỗi: PR đã
   * tồn tại rồi, ném ở đây sẽ kéo theo khối catch xoá mất nhánh vừa tạo.
   */
  const assignReviewers = useCallback(async (pr) => {
    const me = session?.user?.login?.toLowerCase();
    const reviewers = REVIEWERS.filter((r) => r && r.toLowerCase() !== me);
    if (!gh || !reviewers.length) return;

    try {
      await gh.requestReviewers(pr.number, reviewers);
      showToast(`👀 Đã nhờ ${reviewers.join(', ')} review PR #${pr.number}`);
    } catch (err) {
      showToast(`PR #${pr.number} đã mở, nhưng gán review hỏng: ${err.message}`);
    }
  }, [gh, session]);

  // Post operations
  const handleSavePost = async (postData) => {
    if (!gh) throw new Error('Chưa đăng nhập GitHub.');
    const { section, category, slug, title, description, tags, featured, body, isEdit } = postData;

    const action = isEdit ? 'sua' : 'them';
    const bName = branchName(action, slug);
    const filePath = `content/${section}/${category}/${slug}.md`;

    // Compose frontmatter
    let frontmatter = '---\n';
    frontmatter += `title: "${title.replace(/"/g, '\\"')}"\n`;
    if (description) frontmatter += `description: "${description.replace(/"/g, '\\"')}"\n`;
    if (tags.length) frontmatter += `tags: [${tags.map((t) => `"${t}"`).join(', ')}]\n`;
    if (featured) frontmatter += `featured: true\n`;
    frontmatter += '---\n\n';

    const fullContent = frontmatter + body;

    // 1. Create Branch
    await gh.createBranch(bName);

    // 2. Commit File
    await gh.commitFiles(
      [{ path: filePath, content: fullContent }],
      isEdit ? `docs: cập nhật bài viết "${title}"` : `docs: thêm bài viết mới "${title}"`,
      bName
    );

    // 3. Open PR
    const pr = await gh.createPullRequest({
      head: bName,
      title: `${isEdit ? 'Cập nhật' : 'Thêm'} bài viết: ${title}`,
      body: `### Thay đổi từ trang Admin Blog Tech\n\n- **Đường dẫn**: \`${filePath}\`\n- **Tiêu đề**: ${title}\n- **Chuyên mục**: \`${section}/${category}\``,
    });

    await assignReviewers(pr);

    showToast(`✓ Đã mở PR #${pr.number} thành công!`);
    changeView('list');
    loadPosts();
  };

  const handleDeletePost = async (post) => {
    if (!gh) return;
    if (!confirm(`Bạn có chắc chắn muốn xoá bài "${post.title}"?\nThao tác này sẽ tạo một Pull Request xoá bài.`)) {
      return;
    }

    try {
      const bName = branchName('xoa', post.slug);
      await gh.createBranch(bName);
      await gh.commitFiles(
        [{ path: post.path, remove: true }],
        `docs: xoá bài viết "${post.title}"`,
        bName
      );
      const pr = await gh.createPullRequest({
        head: bName,
        title: `Xoá bài viết: ${post.title}`,
        body: `### Xoá bài viết từ trang Admin\n\n- **Đường dẫn**: \`${post.path}\``,
      });

      await assignReviewers(pr);

      showToast(`✓ Đã mở PR #${pr.number} xoá bài!`);
      loadPosts();
    } catch (err) {
      alert(`Lỗi khi xoá: ${err.message}`);
    }
  };

  const handleEditPost = async (post) => {
    if (!gh) return;
    try {
      const rawContent = await gh.readFile(post.path);
      if (!rawContent) {
        alert('Không tải được nội dung bài từ GitHub.');
        return;
      }

      // Parse frontmatter
      let title = post.title;
      let description = '';
      let tags = [];
      let featured = false;
      let body = rawContent;

      const fmMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (fmMatch) {
        body = fmMatch[2];
        const fmLines = fmMatch[1].split('\n');
        fmLines.forEach((line) => {
          if (line.startsWith('title:')) title = line.replace('title:', '').replace(/["']/g, '').trim();
          if (line.startsWith('description:')) description = line.replace('description:', '').replace(/["']/g, '').trim();
          if (line.startsWith('featured:')) featured = /true/i.test(line);
          if (line.startsWith('tags:')) {
            const rawTags = line.replace('tags:', '').replace(/[\[\]"']/g, '').split(',');
            tags = rawTags.map((t) => t.trim()).filter(Boolean);
          }
        });
      }

      setEditingPost({
        path: post.path,
        section: post.section,
        category: post.category,
        slug: post.slug,
        title,
        description,
        tags,
        featured,
        body,
      });
      changeView('editor');
    } catch (err) {
      alert(`Lỗi tải bài viết: ${err.message}`);
    }
  };

  // Submit Quiz PR
  const handleSubmitQuiz = async ({ docId, title, tags, quizPayload }) => {
    if (!gh) throw new Error('Chưa đăng nhập GitHub.');

    const doc = docs.find((d) => d.id === docId);
    if (!doc) throw new Error('Không tìm thấy thông tin bài viết đã liên kết.');

    const bName = branchName('quiz', doc.slug);
    const quizPath = `content/${doc.section}/${doc.category}/${doc.slug}.quiz.json`;
    const jsonContent = JSON.stringify(quizPayload, null, 2);

    await gh.createBranch(bName);
    await gh.commitFiles(
      [{ path: quizPath, content: jsonContent }],
      `docs: cập nhật câu hỏi quiz cho bài "${doc.title}"`,
      bName
    );

    const pr = await gh.createPullRequest({
      head: bName,
      title: `Cập nhật câu hỏi quiz: ${doc.title}`,
      body: `### Cập nhật Quiz từ Admin Blog Tech\n\n- **Bài viết**: \`${doc.id}\`\n- **File Quiz**: \`${quizPath}\`\n- **Số câu hỏi**: ${quizPayload.quizzes?.length || 0}`,
    });

    await assignReviewers(pr);

    showToast(`✓ Đã đăng bài quiz thành công! (PR #${pr.number})`);
  };

  if (!session && !isGuestMode) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <AdminNavbar view="login" onChangeView={() => {}} user={null} onLogout={() => {}} />
        <AdminLogin
          onLogin={handleLogin}
          onOpenGuestQuiz={() => {
            setIsGuestMode(true);
            setView('quiz');
          }}
          error={loginError}
          loading={loading}
        />
        <Footer />
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen flex flex-col transition-colors duration-200">
      <AdminNavbar
        view={view}
        onChangeView={changeView}
        user={session?.user}
        onLogout={handleLogout}
      />

      <div className="admin-content-area flex-1">
        {view === 'list' && (
          <PostList
            posts={posts}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onRefresh={loadPosts}
            loading={loading}
          />
        )}

        {view === 'editor' && (
          <PostEditor
            sections={sections}
            editingPost={editingPost}
            onSavePost={handleSavePost}
            onCancel={() => changeView('list')}
            loading={loading}
          />
        )}

        {view === 'quiz' && (
          <QuizManager
            docs={docs}
            sections={sections}
            onSubmitQuiz={handleSubmitQuiz}
            isGuestMode={isGuestMode && !session}
            loading={loading}
          />
        )}
      </div>

      <Footer />
      <Toast />
    </div>
  );
}
