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

  // Edge case: single-digit vs multi-digit patch numbers (e.g. 1.0.9 vs 1.0.10)
  it('correctly compares double-digit patch versions', () => {
    expect(compareSemver('1.0.10', '1.0.9')).toBe(1);
    expect(compareSemver('1.0.9', '1.0.10')).toBe(-1);
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
