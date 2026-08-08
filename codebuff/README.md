# LyraShield Review for Codebuff

This is the native Agent Store source. Copy it into a Codebuff publisher repository,
replace the local `types/agent-definition` import with the generated Codebuff types, and
publish it as `lyrashield-ai/lyrashield-review`. The agent is intentionally read-only:
mutating requests explain the pending LyraShield approval and link to dashboard evidence.
