import React from 'react';

export function EmptyState({ icon = '📦', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
