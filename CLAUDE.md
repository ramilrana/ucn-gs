# UCN Graduate School Accreditation Website

## Workflow: plan, execute, review

Model routing is set in `.claude/settings.json` (`model: opusplan`, `effortLevel: high`): Plan Mode runs on Opus, everything after plan approval runs on Sonnet. Do not try to switch models by prompt.

1. **Plan** every non-trivial task in Plan Mode. The plan lists phases, acceptance criteria per phase, and the checks to run (`npm run lint`, `npm run typecheck`, `npm run build`, `npm run audit:prod`).
2. **Execute** the approved plan in the main session.
3. **Review** by invoking the `ucn-opus-reviewer` subagent (read-only, Opus) at each checkpoint, one at a time:
   - A. After the shared architecture, routing, and design foundation.
   - B. After the main page families and reusable components.
   - C. Before final completion: security, accessibility, and lint/typecheck/build/audit.

   Pass it the checkpoint name, that phase's acceptance criteria, the files or diff in scope, and any findings still open from earlier reviews.
4. **Fix** every Critical and High finding (and Medium ones unless deferral is justified), then rerun the relevant checks.
5. **Re-review** the same checkpoint if Critical or High findings remain unresolved. Move on only when the verdict is PASS or PASS WITH ISSUES with no open Critical/High findings.
6. Only say a review happened if the reviewer actually ran and returned findings. Quote its verdict; never paraphrase a review that did not occur.
7. **Track state** in `.claude/review-log.md` (append-only): per checkpoint, the date, task status, checks run with pass/fail, reviewer verdict, findings fixed, and findings still open. Read it at the start of each phase and after context compaction.
