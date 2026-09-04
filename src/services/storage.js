// Quản lý LocalStorage & SessionStorage tập trung cho toàn bộ ứng dụng Blog Tech

const KEYS = {
  THEME: "blog.theme",
  COMPLETED: "blog.completedDocs",
  QUIZ_ANSWERS: "blog.quiz.answers",
  QUIZ_CHECKED: "blog.quiz.checked",
  QUIZ_HISTORY: "blog.quizHistory",
  ADMIN_SESSION: "blog.adminSession",
  ADMIN_DRAFT: "blog.adminDraft",
  QUIZ_PREVIEW: "blog.quiz.preview",
  FONT_SIZE: "blog.fontSize",
  READER_PREVIEW: "blog.readerPreview",
};

export const Storage = {
  // Theme
  getPreferredTheme() {
    try {
      const saved = localStorage.getItem(KEYS.THEME);
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  },

  hasThemeChoice() {
    try {
      return !!localStorage.getItem(KEYS.THEME);
    } catch {
      return false;
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(KEYS.THEME, theme);
      document.documentElement.setAttribute("data-theme", theme);
    } catch (e) {
      console.warn("Lỗi lưu theme:", e);
    }
  },

  // Tiến độ học (Completed Docs)
  getCompletedDocs() {
    try {
      const raw = localStorage.getItem(KEYS.COMPLETED);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  },

  isDocCompleted(docId) {
    return this.getCompletedDocs().has(docId);
  },

  toggleDocCompleted(docId) {
    try {
      const set = this.getCompletedDocs();
      const isNowCompleted = !set.has(docId);
      if (isNowCompleted) set.add(docId);
      else set.delete(docId);
      localStorage.setItem(KEYS.COMPLETED, JSON.stringify([...set]));
      window.dispatchEvent(
        new CustomEvent("doc-completion-changed", { detail: { id: docId, isCompleted: isNowCompleted } })
      );
      return isNowCompleted;
    } catch (e) {
      console.warn("Lỗi lưu tiến độ:", e);
      return false;
    }
  },

  // Trắc nghiệm Quiz
  getQuizAnswers() {
    try {
      const raw = localStorage.getItem(KEYS.QUIZ_ANSWERS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveQuizAnswers(answers) {
    try {
      localStorage.setItem(KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
    } catch (e) {
      console.warn("Lỗi lưu đáp án quiz:", e);
    }
  },

  getQuizChecked() {
    try {
      const raw = localStorage.getItem(KEYS.QUIZ_CHECKED);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  },

  saveQuizChecked(checkedSet) {
    try {
      localStorage.setItem(KEYS.QUIZ_CHECKED, JSON.stringify([...checkedSet]));
    } catch (e) {
      console.warn("Lỗi lưu trạng thái checked:", e);
    }
  },

  // Font Size
  getFontSize() {
    try {
      return parseInt(localStorage.getItem(KEYS.FONT_SIZE), 10) || 100;
    } catch {
      return 100;
    }
  },

  setFontSize(size) {
    try {
      localStorage.setItem(KEYS.FONT_SIZE, String(size));
    } catch (e) {
      console.warn("Lỗi lưu font size:", e);
    }
  },
};

export const storage = Storage;
export default Storage;
