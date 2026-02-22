import { keyframes } from "@emotion/react";

type CssVarName = `--${string}`;

type PulsingDropShadowOptions = {
  minShadow: string;
  maxShadow: string;
  minVarName?: CssVarName;
  maxVarName?: CssVarName;
  duration?: string;
  easing?: string;
  iterationCount?: string;
};

const keyframesCache = new Map<string, ReturnType<typeof keyframes>>();

const getDropShadowPulseKeyframes = (minVarName: CssVarName, maxVarName: CssVarName): ReturnType<typeof keyframes> => {
  const cacheKey = `${minVarName}|${maxVarName}`;
  const cached = keyframesCache.get(cacheKey);
  if (cached) return cached;

  const created = keyframes`
    0%, 100% { filter: drop-shadow(var(${minVarName})); }
    50% { filter: drop-shadow(var(${maxVarName})); }
  `;
  keyframesCache.set(cacheKey, created);
  return created;
};

export const getPulsingDropShadowSx = ({
  minShadow,
  maxShadow,
  minVarName = "--pulsing-shadow-min",
  maxVarName = "--pulsing-shadow-max",
  duration = "2.5s",
  easing = "ease-in-out",
  iterationCount = "infinite",
}: PulsingDropShadowOptions) => {
  const pulseKeyframes = getDropShadowPulseKeyframes(minVarName, maxVarName);
  const cssVars: Record<string, string> = {
    [minVarName]: minShadow,
    [maxVarName]: maxShadow,
  };

  return {
    ...cssVars,
    filter: `drop-shadow(var(${minVarName}))`,
    animation: `${pulseKeyframes} ${duration} ${easing} ${iterationCount}`,
  } as const;
};

