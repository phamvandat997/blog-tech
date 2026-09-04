import { useState, useCallback, useMemo } from 'react';
import { Storage } from '../services/storage';
import defaultQuizBank from '../generated/quizBank.json';

export function useQuiz() {
  const [answers, setAnswers] = useState(() => Storage.getQuizAnswers());
  const [checkedSet, setCheckedSet] = useState(() => Storage.getQuizChecked());
  const [previewBank, setPreviewBank] = useState(() => {
    try {
      const raw = sessionStorage.getItem('blog.quiz.preview');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          [parsed.docId || 'preview/quiz']: {
            docId: parsed.docId || 'preview/quiz',
            title: parsed.title || 'Bài thi trắc nghiệm xem thử',
            quizzes: parsed.quizzes || [],
            tags: parsed.tags || [],
          },
        };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const quizBank = useMemo(() => {
    return { ...defaultQuizBank, ...(previewBank || {}) };
  }, [previewBank]);

  const qKeyOf = useCallback((docId, number) => `${docId}#${number}`, []);

  const getAnswers = useCallback(
    (qKey) => {
      return answers[qKey] || [];
    },
    [answers]
  );

  const isChecked = useCallback(
    (qKey) => {
      return checkedSet.has(qKey);
    },
    [checkedSet]
  );

  const isCorrect = useCallback(
    (qKey, question) => {
      const picked = new Set(answers[qKey] || []);
      const correct = new Set(question.correctAnswers || []);
      return picked.size === correct.size && [...picked].every((k) => correct.has(k));
    },
    [answers]
  );

  const toggleAnswer = useCallback(
    (qKey, optKey, isMulti) => {
      if (checkedSet.has(qKey)) return; // Lock if already submitted/checked

      setAnswers((prev) => {
        const current = prev[qKey] || [];
        let updated;
        if (isMulti) {
          if (current.includes(optKey)) {
            updated = current.filter((k) => k !== optKey);
          } else {
            updated = [...current, optKey];
          }
        } else {
          updated = [optKey];
        }
        const nextAnswers = { ...prev, [qKey]: updated };
        Storage.saveQuizAnswers(nextAnswers);
        return nextAnswers;
      });
    },
    [checkedSet]
  );

  const checkSingleQuestion = useCallback((qKey) => {
    setCheckedSet((prev) => {
      const next = new Set(prev);
      next.add(qKey);
      Storage.saveQuizChecked(next);
      return next;
    });
  }, []);

  const submitAll = useCallback(
    (docId) => {
      const docQuiz = quizBank[docId];
      if (!docQuiz || !docQuiz.quizzes) return;

      setCheckedSet((prev) => {
        const next = new Set(prev);
        docQuiz.quizzes.forEach((q) => {
          next.add(qKeyOf(docId, q.number));
        });
        Storage.saveQuizChecked(next);
        return next;
      });
    },
    [quizBank, qKeyOf]
  );

  const resetQuiz = useCallback(
    (docId) => {
      const docQuiz = quizBank[docId];
      if (!docQuiz || !docQuiz.quizzes) return;

      const keysToRemove = new Set(docQuiz.quizzes.map((q) => qKeyOf(docId, q.number)));

      setAnswers((prev) => {
        const next = { ...prev };
        keysToRemove.forEach((key) => delete next[key]);
        Storage.saveQuizAnswers(next);
        return next;
      });

      setCheckedSet((prev) => {
        const next = new Set(prev);
        keysToRemove.forEach((key) => next.delete(key));
        Storage.saveQuizChecked(next);
        return next;
      });
    },
    [quizBank, qKeyOf]
  );

  const getScore = useCallback(
    (docId) => {
      const docQuiz = quizBank[docId];
      if (!docQuiz || !docQuiz.quizzes || !docQuiz.quizzes.length) {
        return { correct: 0, answered: 0, total: 0, pct: 0 };
      }

      const total = docQuiz.quizzes.length;
      let answered = 0;
      let correct = 0;

      docQuiz.quizzes.forEach((q) => {
        const qKey = qKeyOf(docId, q.number);
        if (checkedSet.has(qKey)) {
          answered++;
          const picked = new Set(answers[qKey] || []);
          const right = new Set(q.correctAnswers || []);
          if (picked.size === right.size && [...picked].every((k) => right.has(k))) {
            correct++;
          }
        }
      });

      return {
        correct,
        answered,
        total,
        pct: total ? Math.round((correct / total) * 100) : 0,
      };
    },
    [quizBank, checkedSet, answers, qKeyOf]
  );

  return {
    quizBank,
    answers,
    checkedSet,
    qKeyOf,
    getAnswers,
    isChecked,
    isCorrect,
    toggleAnswer,
    checkSingleQuestion,
    submitAll,
    resetQuiz,
    getScore,
  };
}
