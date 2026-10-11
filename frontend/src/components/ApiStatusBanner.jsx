import React, { useState } from 'react';

/**
 * ApiStatusBanner Component
 * Informs the user of backend and Neon PostgreSQL database connectivity status.
 */
export default function ApiStatusBanner({ status, onRetry, isRetrying }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !status) return null;

  // Status variants
  const isSuccess = status.type === 'connected';
  const isWarning = status.type === 'db_pending';
  const isOffline = status.type === 'offline';

  let bannerClass = 'api-status-banner';
  let icon = 'ℹ️';
  let title = 'Backend Status';

  if (isSuccess) {
    bannerClass += ' status-banner-success';
    icon = '🟢';
    title = 'Live Neon PostgreSQL Connected';
  } else if (isWarning) {
    bannerClass += ' status-banner-warning';
    icon = '⚡';
    title = 'Neon Database Connection Notice';
  } else if (isOffline) {
    bannerClass += ' status-banner-offline';
    icon = '📡';
    title = 'Local Catalog Mode (Backend Offline)';
  }

  return (
    <aside className={bannerClass} role="status" aria-label="Database connectivity notice">
      <div className="container status-banner-inner">
        <div className="status-banner-content">
          <span className="status-icon" aria-hidden="true">{icon}</span>
          <div className="status-text">
            <strong>{title}</strong>
            <span className="status-details"> — {status.message}</span>
          </div>
        </div>

        <div className="status-banner-actions">
          {(!isSuccess || isWarning) && (
            <button
              type="button"
              className="btn btn-sm btn-outline-status"
              onClick={onRetry}
              disabled={isRetrying}
              title="Re-check backend and database connection"
            >
              {isRetrying ? 'Checking...' : '↻ Re-check Connection'}
            </button>
          )}

          <button
            type="button"
            className="btn-status-close"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss status notification"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
