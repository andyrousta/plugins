import { compareSemver, checkCompatibility, formatCompatibilityReport } from './index';

/**
 * Tests for the agent-compatibility plugin
 * Covers semver comparison, compatibility checking, and report formatting
 */

describe('compareSemver', () => {
  it('returns 0 for equal versions', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('2.3.4', '2.3.4')).toBe(0);
  });

  it('returns 1 when first version is greater (major)', () => {
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
  });

  it('returns -1 when first version is lesser (major)', () => {
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
  });

  it('returns 1 when first version is greater (minor)', () => {
    expect(compareSemver('1.2.0', '1.1.9')).toBe(1);
  });

  it('returns -1 when first version is lesser (minor)', () => {
    expect(compareSemver('1.1.0', '1.2.0')).toBe(-1);
  });

  it('returns 1 when first version is greater (patch)', () => {
    expect(compareSemver('1.0.2', '1.0.1')).toBe(1);
  });

  it('returns -1 when first version is lesser (patch)', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
  });

  it('handles versions with v prefix', () => {
    expect(compareSemver('v1.0.0', 'v1.0.0')).toBe(0);
    expect(compareSemver('v2.0.0', 'v1.0.0')).toBe(1);
  });
});

describe('checkCompatibility', () => {
  const pluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    minAgentVersion: '0.40.0',
    maxAgentVersion: '1.0.0',
  };

  it('returns compatible when agent version is within range', () => {
    const result = checkCompatibility(pluginManifest, '0.45.0');
    expect(result.compatible).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('returns compatible when agent version equals minAgentVersion', () => {
    const result = checkCompatibility(pluginManifest, '0.40.0');
    expect(result.compatible).toBe(true);
  });

  it('returns compatible when agent version equals maxAgentVersion', () => {
    const result = checkCompatibility(pluginManifest, '1.0.0');
    expect(result.compatible).toBe(true);
  });

  it('returns incompatible when agent version is below minimum', () => {
    const result = checkCompatibility(pluginManifest, '0.39.9');
    expect(result.compatible).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toMatch(/minimum/i);
  });

  it('returns incompatible when agent version exceeds maximum', () => {
    const result = checkCompatibility(pluginManifest, '1.1.0');
    expect(result.compatible).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toMatch(/maximum/i);
  });

  it('returns compatible when no maxAgentVersion is specified', () => {
    const openManifest = { ...pluginManifest, maxAgentVersion: undefined };
    const result = checkCompatibility(openManifest, '99.0.0');
    expect(result.compatible).toBe(true);
  });

  it('returns compatible when no minAgentVersion is specified', () => {
    const openManifest = { ...pluginManifest, minAgentVersion: undefined };
    const result = checkCompatibility(openManifest, '0.1.0');
    expect(result.compatible).toBe(true);
  });
});

describe('formatCompatibilityReport', () => {
  it('formats a passing report correctly', () => {
    const report = formatCompatibilityReport({
      pluginId: 'my-plugin',
      pluginVersion: '1.2.3',
      agentVersion: '0.50.0',
      compatible: true,
      issues: [],
    });

    expect(report).toContain('my-plugin');
    expect(report).toContain('1.2.3');
    expect(report).toContain('0.50.0');
    expect(report).toMatch(/compatible/i);
    expect(report).not.toMatch(/incompatible/i);
  });

  it('formats a failing report with issues', () => {
    const report = formatCompatibilityReport({
      pluginId: 'my-plugin',
      pluginVersion: '1.2.3',
      agentVersion: '0.30.0',
      compatible: false,
      issues: ['Agent version 0.30.0 is below the minimum required version 0.40.0'],
    });

    expect(report).toContain('my-plugin');
    expect(report).toMatch(/incompatible/i);
    expect(report).toContain('0.30.0 is below the minimum');
  });

  it('includes all issues in the report', () => {
    const issues = [
      'Agent version 0.30.0 is below the minimum required version 0.40.0',
      'Missing required capability: streaming',
    ];
    const report = formatCompatibilityReport({
      pluginId: 'my-plugin',
      pluginVersion: '1.0.0',
      agentVersion: '0.30.0',
      compatible: false,
      issues,
    });

    issues.forEach((issue) => {
      expect(report).toContain(issue);
    });
  });
});
