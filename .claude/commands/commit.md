---
description: Run code review, lint, type checks, then commit with a descriptive message
argument-hint: [optional commit message]
---

# Pre-Commit Pipeline

## Context

- Current branch: !`git branch --show-current`
- Uncommitted changes: !`git diff --stat`
- Staged changes: !`git diff --cached --stat`

## Your Task

Run a full quality pipeline before committing. Follow these steps **in order** — stop at the first failure.

### Step 1: Check there are changes to commit

Run `git status` to verify there are staged or unstaged changes. If there's nothing to commit, tell the user and stop.

### Step 2: Run lint and type checks in parallel

Run these commands in parallel:

```bash
pnpm lint
```

```bash
pnpm build
```

If either fails:
- Show the errors clearly
- Suggest fixes
- **Do NOT proceed to commit**
- Ask the user if they want you to fix the issues

### Step 3: Run code review

Invoke `/code-review` on the uncommitted changes. Focus on the changed files only — not the full branch diff.

If **blockers** are found:
- Present them clearly
- **Do NOT proceed to commit**
- Ask the user if they want you to fix the blockers first

If only **suggestions** are found:
- Present them as a summary
- Proceed to commit (suggestions don't block)

### Step 4: Stage and commit

1. Stage the relevant files (prefer specific files over `git add -A`)
2. Draft a commit message:
   - If `$ARGUMENTS` is provided, use it as the commit message
   - Otherwise, analyze the diff and write a concise message following the repo's commit style (see recent commits via `git log --oneline -10`)
   - Format: `<type>: <description>` where type is one of: feat, fix, refactor, docs, infra, polish, chore
3. Create the commit using a HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<commit message here>
EOF
)"
```

4. Run `git status` after commit to verify success

### Step 5: Report

Show:
- Commit hash and message
- Files included
- Any review suggestions that were deferred (not blockers)
- Remind: "Run `git push` when ready"

## Important

- Do NOT push automatically — only commit
- Do NOT add Co-Authored-By lines to commits
- Do NOT skip hooks (--no-verify)
- If the pre-commit hook fails, fix the issue and create a NEW commit (don't amend)
- Do NOT commit files that likely contain secrets (.env, credentials.json, etc.)
