import { describe, it, expect } from 'bun:test';
import {
  themes,
  themeNames,
  defaultTheme,
  getPriorityColor,
  catppuccin,
  dracula,
  nord,
  gruvbox,
  tokyoNight,
  solarized,
  oneDark,
  monokai,
  type Theme,
  type ThemeColors,
} from './index.ts';

describe('Theme System', () => {
  describe('theme definitions', () => {
    it('should have 8 predefined themes', () => {
      expect(themeNames).toHaveLength(8);
    });

    it('should have catppuccin as default theme', () => {
      expect(defaultTheme).toBe('catppuccin');
    });

    it('should include all expected themes', () => {
      expect(themeNames).toContain('catppuccin');
      expect(themeNames).toContain('dracula');
      expect(themeNames).toContain('nord');
      expect(themeNames).toContain('gruvbox');
      expect(themeNames).toContain('tokyoNight');
      expect(themeNames).toContain('solarized');
      expect(themeNames).toContain('oneDark');
      expect(themeNames).toContain('monokai');
    });

    it('should have all themes accessible via themes object', () => {
      for (const name of themeNames) {
        expect(themes[name]).toBeDefined();
        expect(themes[name]?.name).toBeDefined();
        expect(themes[name]?.colors).toBeDefined();
      }
    });
  });

  describe('theme color structure', () => {
    const requiredColorKeys: (keyof ThemeColors)[] = [
      'priorityHigh',
      'priorityMedium',
      'priorityLow',
      'success',
      'muted',
      'border',
      'highlight',
      'overdue',
      'project',
      'context',
      'date',
      'text',
      'textDim',
      'background',
      'selection',
    ];

    it('should have all required color keys in each theme', () => {
      for (const name of themeNames) {
        const theme = themes[name]!;
        for (const key of requiredColorKeys) {
          expect(theme.colors[key]).toBeDefined();
          expect(typeof theme.colors[key]).toBe('string');
        }
      }
    });

    it('should have valid hex color format for all colors', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      for (const name of themeNames) {
        const theme = themes[name]!;
        for (const key of requiredColorKeys) {
          const color = theme.colors[key];
          expect(hexColorRegex.test(color)).toBe(true);
        }
      }
    });
  });

  describe('catppuccin theme', () => {
    it('should have correct name', () => {
      expect(catppuccin.name).toBe('Catppuccin');
    });

    it('should have red-ish priority high color', () => {
      // Catppuccin red is #f38ba8
      expect(catppuccin.colors.priorityHigh).toBe('#f38ba8');
    });

    it('should have peach/orange priority medium color', () => {
      expect(catppuccin.colors.priorityMedium).toBe('#fab387');
    });

    it('should have blue priority low color', () => {
      expect(catppuccin.colors.priorityLow).toBe('#89b4fa');
    });

    it('should have dark background', () => {
      // Dark theme has RGB values below 128
      const bg = catppuccin.colors.background;
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      expect(r).toBeLessThan(128);
      expect(g).toBeLessThan(128);
      expect(b).toBeLessThan(128);
    });
  });

  describe('dracula theme', () => {
    it('should have correct name', () => {
      expect(dracula.name).toBe('Dracula');
    });

    it('should have distinctive dracula colors', () => {
      expect(dracula.colors.priorityHigh).toBe('#ff5555');
      expect(dracula.colors.success).toBe('#50fa7b');
      expect(dracula.colors.project).toBe('#bd93f9');
    });
  });

  describe('getPriorityColor', () => {
    const theme = catppuccin;

    it('should return high priority color for A-C', () => {
      expect(getPriorityColor('A', theme)).toBe(theme.colors.priorityHigh);
      expect(getPriorityColor('B', theme)).toBe(theme.colors.priorityHigh);
      expect(getPriorityColor('C', theme)).toBe(theme.colors.priorityHigh);
    });

    it('should return medium priority color for D-F', () => {
      expect(getPriorityColor('D', theme)).toBe(theme.colors.priorityMedium);
      expect(getPriorityColor('E', theme)).toBe(theme.colors.priorityMedium);
      expect(getPriorityColor('F', theme)).toBe(theme.colors.priorityMedium);
    });

    it('should return low priority color for G-Z', () => {
      expect(getPriorityColor('G', theme)).toBe(theme.colors.priorityLow);
      expect(getPriorityColor('M', theme)).toBe(theme.colors.priorityLow);
      expect(getPriorityColor('Z', theme)).toBe(theme.colors.priorityLow);
    });

    it('should return muted color for null priority', () => {
      expect(getPriorityColor(null, theme)).toBe(theme.colors.muted);
    });

    it('should handle numeric priorities 0-2 as high', () => {
      expect(getPriorityColor('0', theme)).toBe(theme.colors.priorityHigh);
      expect(getPriorityColor('1', theme)).toBe(theme.colors.priorityHigh);
      expect(getPriorityColor('2', theme)).toBe(theme.colors.priorityHigh);
    });

    it('should handle numeric priorities 3-5 as medium', () => {
      expect(getPriorityColor('3', theme)).toBe(theme.colors.priorityMedium);
      expect(getPriorityColor('4', theme)).toBe(theme.colors.priorityMedium);
      expect(getPriorityColor('5', theme)).toBe(theme.colors.priorityMedium);
    });

    it('should handle numeric priorities 6-9 as low', () => {
      expect(getPriorityColor('6', theme)).toBe(theme.colors.priorityLow);
      expect(getPriorityColor('7', theme)).toBe(theme.colors.priorityLow);
      expect(getPriorityColor('8', theme)).toBe(theme.colors.priorityLow);
      expect(getPriorityColor('9', theme)).toBe(theme.colors.priorityLow);
    });
  });

  describe('theme contrast', () => {
    // Helper to calculate relative luminance
    function getLuminance(hex: string): number {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const adjustChannel = (c: number) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

      return 0.2126 * adjustChannel(r) + 0.7152 * adjustChannel(g) + 0.0722 * adjustChannel(b);
    }

    // Helper to calculate contrast ratio
    function getContrastRatio(hex1: string, hex2: string): number {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    it('should have sufficient contrast between text and background for all themes', () => {
      // WCAG AA requires contrast ratio of at least 4.5:1 for normal text
      const minContrast = 3.5; // Being slightly lenient for terminal apps

      for (const name of themeNames) {
        const theme = themes[name]!;
        const ratio = getContrastRatio(theme.colors.text, theme.colors.background);
        expect(ratio).toBeGreaterThan(minContrast);
      }
    });

    it('should have distinct priority colors', () => {
      for (const name of themeNames) {
        const theme = themes[name]!;
        // All three priority colors should be different
        expect(theme.colors.priorityHigh).not.toBe(theme.colors.priorityMedium);
        expect(theme.colors.priorityMedium).not.toBe(theme.colors.priorityLow);
        expect(theme.colors.priorityHigh).not.toBe(theme.colors.priorityLow);
      }
    });
  });
});
