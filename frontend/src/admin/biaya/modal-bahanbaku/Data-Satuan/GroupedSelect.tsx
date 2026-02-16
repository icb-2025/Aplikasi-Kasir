// src/admin/bahan-baku/Data-Satuan/GroupedSelect.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface Group {
  key: string; // e.g. 'volume', 'berat', 'jumlah'
  label: string; // display label for group
  options: Option[];
}

interface Props {
  groups: Group[];
  value: Option | null;
  onChange: (opt: Option | null, groupKey?: string) => void;
  placeholder?: string;
}

const GroupedSelect: React.FC<Props> = ({ groups, value, onChange, placeholder = 'Pilih satuan...' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(g => ({ ...g, options: g.options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) }))
      .filter(g => g.options.length > 0);
  }, [groups, query]);

  return (
    <div ref={ref} className="relative w-full max-w-full">
      <button
        type="button"
        onClick={() => setOpen(s => !s)}
        className="w-full text-left bg-white border rounded px-3 py-2 flex items-center justify-between hover:shadow-sm focus:outline-none"
      >
        <div className="truncate">
          {value ? (
            <div className="text-sm">
              <span className="font-medium mr-2">{value.label}</span>
              <span className="text-xs text-gray-400">{value.value}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">{placeholder}</div>
          )}
        </div>
        <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${open ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded shadow-lg max-h-72 overflow-auto">
          <div className="p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none"
              placeholder="Cari satuan..."
            />
          </div>

          <div className="divide-y">
            {filtered.map((g) => (
              <div key={g.key} className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 mb-2">{g.label}</div>
                <div className="grid grid-cols-1 gap-1">
                  {g.options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        onChange(o, g.key);
                        setOpen(false);
                        setQuery('');
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>{o.label}</span>
                        <span className="text-xs text-gray-400">{o.value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedSelect;