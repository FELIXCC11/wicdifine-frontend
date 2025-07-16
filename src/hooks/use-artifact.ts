import { useState } from 'react';

// Dummy Zustand-like selector for build to succeed
export const useArtifactSelector = (selector: (state: { isVisible: boolean }) => any) => {
  const [isVisible] = useState(false); // default hidden
  return selector({ isVisible });
};
