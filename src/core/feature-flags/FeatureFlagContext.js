import { createContext, useContext } from "react";
import { DEFAULT_UI_FEATURE_FLAGS } from "@admin-platform/shared-types";

/**
 * @typedef {import("@admin-platform/shared-types").UIFeatureFlags} UIFeatureFlags
 * @typedef {import("@admin-platform/shared-types").UIFeatureFlagKey} UIFeatureFlagKey
 */

const FeatureFlagContext = createContext(DEFAULT_UI_FEATURE_FLAGS);

/**
 * Provides feature flags to the component tree.
 * Falls back to DEFAULT_UI_FEATURE_FLAGS when flags prop is undefined.
 *
 * @param {{ flags?: UIFeatureFlags, children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function FeatureFlagProvider({ flags, children }) {
  const value = flags ?? DEFAULT_UI_FEATURE_FLAGS;
  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Returns the full feature flags object from context.
 *
 * @returns {UIFeatureFlags}
 */
export function useUIFeatureFlags() {
  return useContext(FeatureFlagContext);
}

/**
 * Returns whether a specific feature flag is enabled.
 * Defaults to true if the key is not found in the flags object.
 *
 * @param {UIFeatureFlagKey} key
 * @returns {boolean}
 */
export function useFeatureEnabled(key) {
  const flags = useContext(FeatureFlagContext);
  return flags[key] ?? true;
}
