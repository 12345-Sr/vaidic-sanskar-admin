import React, { useState, useMemo } from 'react';

/**
 * Generic data table.
 * props:
 *   columns: [{ key, label, render?(row), className? }]
 *   rows, searchKeys, statusKey, statuses (for the segmented filter),
 *   actions(row) → JSX, banner (optional node), usingMock
 */
export default function DataTable({ columns, rows, searchKeys = [], statusKey, statuses, actions, banner, search = '', onRowClick }) {
  const [seg, setSeg] = useState('All');

  const filtered = useMemo(() => {
    let out = rows;
    if (seg !== 'All' && statusKey) out = out.filter((r) => r[statusKey] === seg);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
    }
    return out;
  }, [rows, seg, search, statusKey, searchKeys]);

  return (
    <div>
      {banner}
      {statuses && statuses.length > 1 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="toolbar" style={{ borderBottom: 0 }}>
            <div className="seg">
              {['All', ...statuses].map((s) => (
                <button key={s} className={seg === s ? 'on' : ''} onClick={() => setSeg(s)}>{s}</button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} records</span>
          </div>
        </div>
      )}
      <div className="card">
        <div className="tablewrap">
          {filtered.length === 0 ? (
            <div className="empty">Koi record nahi mila.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                  {actions && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    title={onRowClick ? 'Click to inspect full details' : undefined}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={c.className}>
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                    {actions && <td onClick={(e) => e.stopPropagation()}>{actions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
