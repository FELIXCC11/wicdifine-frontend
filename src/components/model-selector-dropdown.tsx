'use client';

import { useState, useRef, useEffect } from 'react';

const MODELS = [
  { id: 'wicfin-3.0', name: 'WICFIN 3.0', status: 'current' },
  { id: 'wicfin-4.0', name: 'WICFIN 4.0', status: 'coming-soon' },
];

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function ModelSelectorDropdown({ selectedModel = 'wicfin-3.0', onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-white/20 hover:bg-white/10"
      >
        <span className="font-medium text-white">{currentModel.name}</span>
        {currentModel.status === 'current' && (
          <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400">
            Current
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/10 bg-slate-900 shadow-lg">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                if (model.status !== 'coming-soon') {
                  onModelChange?.(model.id);
                  setIsOpen(false);
                }
              }}
              disabled={model.status === 'coming-soon'}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg ${
                model.status === 'coming-soon'
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-white/10'
              } ${selectedModel === model.id ? 'bg-white/5' : ''}`}
            >
              <div>
                <p className="font-medium text-white">{model.name}</p>
                <p className="text-xs text-gray-400">
                  {model.status === 'current' ? 'Stable and reliable' : 'Coming soon'}
                </p>
              </div>
              {model.status === 'coming-soon' ? (
                <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                  Coming Soon
                </span>
              ) : selectedModel === model.id ? (
                <svg className="h-5 w-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
