import React from 'react';
import { PRESET_TEMPLATES, PresetTemplate } from '../utils/fitnessCalculations';
import { Sparkles, X, ArrowRight, Dumbbell, Zap, Flame, Shield } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Preset Fitness Templates</h2>
              <p className="text-xs text-slate-400">
                Choose a proven split configuration to quickly generate or customize
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_TEMPLATES.map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                    {preset.badge}
                  </span>
                  <span className="text-xs text-slate-500">
                    {preset.profile.availableWorkoutDays} Days / Week
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-1.5">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {preset.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 capitalize">
                  {preset.profile.availableEquipment?.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
