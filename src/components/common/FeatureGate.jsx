import { useFeatureEnabled } from "../../core/feature-flags/FeatureFlagContext";

/**
 * @typedef {import("@admin-platform/shared-types").UIFeatureFlagKey} UIFeatureFlagKey
 */

/**
 * Conditionally renders children based on a feature flag.
 * Shows fallback content when the flag is disabled.
 *
 * @param {{ flagKey: UIFeatureFlagKey, children: React.ReactNode, fallback?: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function FeatureGate({ flagKey, children, fallback = null }) {
  const enabled = useFeatureEnabled(flagKey);
  return enabled ? <>{children}</> : <>{fallback}</>;
}
