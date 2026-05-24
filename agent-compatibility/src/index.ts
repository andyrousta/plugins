/**
 * Agent Compatibility Plugin
 * 
 * Provides utilities to check and enforce compatibility between
 * Cursor agents and plugin APIs across different versions.
 */

export interface CompatibilityResult {
  compatible: boolean;
  requiredVersion: string;
  currentVersion: string;
  warnings: string[];
  errors: string[];
}

export interface AgentCapabilities {
  version: string;
  supportedApis: string[];
  features: Record<string, boolean>;
}

export interface PluginRequirements {
  minAgentVersion: string;
  requiredApis: string[];
  optionalApis?: string[];
  requiredFeatures?: Record<string, boolean>;
}

/**
 * Compares two semver version strings.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 */
export function compareSemver(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

/**
 * Checks whether the current agent capabilities satisfy
 * the requirements declared by a plugin.
 */
export function checkCompatibility(
  capabilities: AgentCapabilities,
  requirements: PluginRequirements
): CompatibilityResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check minimum agent version
  const versionOk =
    compareSemver(capabilities.version, requirements.minAgentVersion) >= 0;

  if (!versionOk) {
    errors.push(
      `Agent version ${capabilities.version} is below the required minimum ${requirements.minAgentVersion}.`
    );
  }

  // Check required APIs
  for (const api of requirements.requiredApis) {
    if (!capabilities.supportedApis.includes(api)) {
      errors.push(`Required API "${api}" is not supported by the current agent.`);
    }
  }

  // Check optional APIs and emit warnings if missing
  for (const api of requirements.optionalApis ?? []) {
    if (!capabilities.supportedApis.includes(api)) {
      warnings.push(
        `Optional API "${api}" is not supported. Some features may be unavailable.`
      );
    }
  }

  // Check required feature flags
  for (const [feature, expected] of Object.entries(
    requirements.requiredFeatures ?? {}
  )) {
    const actual = capabilities.features[feature];
    if (actual !== expected) {
      errors.push(
        `Feature "${feature}" is expected to be ${expected} but is ${
          actual ?? 'undefined'
        }.`
      );
    }
  }

  return {
    compatible: errors.length === 0,
    requiredVersion: requirements.minAgentVersion,
    currentVersion: capabilities.version,
    warnings,
    errors,
  };
}

/**
 * Formats a CompatibilityResult into a human-readable summary string.
 */
export function formatCompatibilityReport(result: CompatibilityResult): string {
  const lines: string[] = [
    `Compatibility: ${result.compatible ? '✅ OK' : '❌ FAILED'}`,
    `Agent version: ${result.currentVersion} (required: >= ${result.requiredVersion})`,
  ];

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((e) => lines.push(`  • ${e}`));
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((w) => lines.push(`  • ${w}`));
  }

  return lines.join('\n');
}
