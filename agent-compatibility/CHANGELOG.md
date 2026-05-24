# Changelog

All notable changes to this plugin will be documented here.

## Unreleased

- Renamed the full-pass skill to `check-agent-compatibility`.
- Renamed `deterministic-scan-review` to `compatibility-scan-review`.
- Renamed `docs-reality-review` to `docs-reliability-review`.
- Clarified the score model so `Agent Compatibility Score` is the final blended score and `Deterministic Compatibility Score` is the raw CLI score.
- Tightened the README, marketplace copy, and agent wording for public release.

## Notes (personal fork)

- Keeping a local copy of this changelog to track upstream changes I care about.
- The rename from `docs-reality-review` to `docs-reliability-review` is a nice fix — "reality" was always a bit ambiguous.
- Worth watching: the blended score weighting between `Agent Compatibility Score` and `Deterministic Compatibility Score` isn't documented anywhere — need to dig into the source to find the actual ratio.
- TODO: check if `compatibility-scan-review` still accepts the same input schema as the old `deterministic-scan-review`, or if there's a breaking change I need to handle in my local config.
