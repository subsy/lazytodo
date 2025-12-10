import React, { ReactNode } from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <box borderStyle="single" borderColor="gray" padding={1}>
      <text color="yellow">{children}</text>
    </box>
  );
}

interface FooterProps {
  children: ReactNode;
}

export function Footer({ children }: FooterProps) {
  return (
    <box borderStyle="single" borderColor="gray" padding={1}>
      <text color="gray">{children}</text>
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
  return (
    <box flexDirection="column" width="100%" height="100%">
      {children}
    </box>
  );
}
