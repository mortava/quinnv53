/**
 * TQL Guidelines Overlay
 * This file stores real-time updates and overrides to the standard underwriting matrices.
 * Updates are triggered via the /tqlup26 command.
 */

export interface GuidelineOverride {
  id: string;
  timestamp: string;
  category: string;
  change: string;
  source: string;
}

export const guidelineOverrides: GuidelineOverride[] = [
  // Initial overrides will be added here
];

export const getActiveOverrides = () => {
  return guidelineOverrides;
};
