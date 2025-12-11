import React from 'react';
import { PriorityChart } from './PriorityChart.tsx';
import { TagsPanel } from './TagsPanel.tsx';
import { CommandHistory } from './CommandHistory.tsx';
import { useTodoStore } from '../store/useTodoStore.ts';

export function PanelContainer() {
  const priorityMode = useTodoStore(state => state.priorityMode);

  // Calculate priority panel width based on mode
  // Each bar is 1 char + 1 space gap, plus border (2) and padding (2)
  // Number mode: 10 bars * 2 = 20 + 4 = 24
  // Letter mode: 26 bars * 2 = 52 + 4 = 56
  const priorityPanelWidth = priorityMode === 'number' ? 24 : 56;

  return (
    <box flexDirection="row" height={10}>
      <box width={priorityPanelWidth}>
        <PriorityChart />
      </box>
      <box flexGrow={1}>
        <TagsPanel type="projects" />
      </box>
      <box flexGrow={1}>
        <TagsPanel type="contexts" />
      </box>
      <box width={39}>
        <CommandHistory />
      </box>
    </box>
  );
}
