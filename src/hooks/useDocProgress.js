import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../services/storage';

export function useDocProgress() {
  const [completedDocs, setCompletedDocs] = useState(() => Storage.getCompletedDocs());

  useEffect(() => {
    const handleCompletionChanged = (e) => {
      const { id, isCompleted } = e.detail || {};
      setCompletedDocs((prev) => {
        const next = new Set(prev);
        if (isCompleted) next.add(id);
        else next.delete(id);
        return next;
      });
    };

    window.addEventListener('doc-completion-changed', handleCompletionChanged);
    return () => {
      window.removeEventListener('doc-completion-changed', handleCompletionChanged);
    };
  }, []);

  const isCompleted = useCallback((id) => {
    return completedDocs.has(id);
  }, [completedDocs]);

  const toggleCompleted = useCallback((id) => {
    return Storage.toggleDocCompleted(id);
  }, []);

  const getSectionProgress = useCallback((sectionDocs = []) => {
    if (!sectionDocs.length) return { completed: 0, total: 0, percentage: 0 };
    const completed = sectionDocs.filter((d) => completedDocs.has(d.id)).length;
    const total = sectionDocs.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [completedDocs]);

  return {
    completedDocs,
    isCompleted,
    toggleCompleted,
    getSectionProgress,
  };
}
