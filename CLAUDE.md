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
7. **Track state** in `CURRENT_STATE.md`: task status, checks run with pass/fail, reviewer verdicts, and findings still open (see Continuity).

## Continuity across conversations

`CURRENT_STATE.md` is the compact snapshot of progress. The approved design spec and implementation plan remain the source of truth for requirements and the full task breakdown; do not turn the state file into a second plan.

- **Start of a conversation:** read `CURRENT_STATE.md` and this file before continuing. Open the design spec and plan only for the sections the current task needs. Do not ask for the original master prompt when these documents already cover it.
- **Update `CURRENT_STATE.md`** at design approval, plan approval, significant implementation progress, each review checkpoint, and the end of every working session. Edit sections in place; do not append repeated summaries. Keep it short and accurate.
- **Always preserve** unfinished work, failed or unrun checks, unresolved review findings, and the exact next task. Record only checks and reviews that actually ran.
- **Never change an approved decision** without a stated reason, recorded under Approved decisions.
- **End of session:** update `CURRENT_STATE.md`, then give the user (1) a short summary of work done, files changed, checks run, and open issues, and (2) a ready-to-paste continuation prompt such as:

  > Read `CLAUDE.md` and `CURRENT_STATE.md`, then resume the first item under Next actions. Read the design spec and plan only as that task needs.
