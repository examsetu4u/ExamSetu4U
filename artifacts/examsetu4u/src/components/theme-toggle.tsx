import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`focus-ring relative flex h-9 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-2.5 text-slate-700 shadow-2xs transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:bg-slate-800/90 dark:text-amber-300 dark:hover:bg-slate-700 dark:hover:text-amber-200 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Theme (लाइट थीम)' : 'Dark Theme (डार्क थीम)'}
      data-testid="button-theme-toggle"
    >
      {isDark ? (
        <Sun size={17} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
