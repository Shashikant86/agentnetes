'use client';

const MODELS = [
  // Gemini 3.x
  { id: 'google/gemini-3.1-pro',        label: 'Gemini 3.1 Pro',        badge: 'latest' },
  { id: 'google/gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', badge: 'fast' },
  { id: 'google/gemini-3-pro',          label: 'Gemini 3 Pro',          badge: '' },
  { id: 'google/gemini-3-flash',        label: 'Gemini 3 Flash',        badge: '' },
  // Gemini 2.5
  { id: 'google/gemini-2.5-pro',        label: 'Gemini 2.5 Pro',        badge: '' },
  { id: 'google/gemini-2.5-flash',      label: 'Gemini 2.5 Flash',      badge: 'recommended' },
  { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', badge: '' },
  // Gemini 2.0
  { id: 'google/gemini-2.0-flash',      label: 'Gemini 2.0 Flash',      badge: '' },
  { id: 'google/gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite', badge: 'budget' },
];

interface Props {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-white/15 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-white/30 cursor-pointer"
      style={{ background: 'var(--bg-hover)', color: 'rgb(var(--fg))' }}
    >
      {MODELS.map(m => (
        <option key={m.id} value={m.id}>
          {m.label}{m.badge ? ` (${m.badge})` : ''}
        </option>
      ))}
    </select>
  );
}
