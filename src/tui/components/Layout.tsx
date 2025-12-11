import React, { ReactNode } from 'react';
import { useTheme } from '../themes/ThemeContext.tsx';
import { StatsPanel, useStatsPanelWidth } from './StatsPanel.tsx';
import { Logo } from './Logo.tsx';

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const theme = useTheme();
  const statsPanelWidth = useStatsPanelWidth();

  return (
    <box flexDirection="row" height={5}>
      <box borderStyle="single" borderColor={theme.colors.border} paddingLeft={1} paddingRight={1} width={30}>
        <Logo />
      </box>
      <box borderStyle="single" borderColor={theme.colors.border} paddingLeft={1} paddingRight={1} flexGrow={1}>
        <text fg={theme.colors.highlight}>{children}</text>
      </box>
      <box width={statsPanelWidth}>
        <StatsPanel />
      </box>
    </box>
  );
}

interface FooterProps {
  children: ReactNode;
}

export function Footer({ children }: FooterProps) {
  const theme = useTheme();

  return (
    <box borderStyle="single" borderColor={theme.colors.border} paddingLeft={1} paddingRight={1}>
      <text fg={theme.colors.textDim}>{children}</text>
    </box>
  );
}

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <box flexGrow={1} padding={1} flexDirection="column">
      {children}
    </box>
  );
}

interface AppContainerProps {
  children: ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const theme = useTheme();

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.colors.background}>
      {children}
    </box>
  );
}
