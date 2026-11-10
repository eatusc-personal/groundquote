# Beads (bd) in this repo

bd is the shared backlog for Eric, Ben and their agents (one Dolt server on the Mac Studio). Run `bd prime` again after compaction or /clear.

## When to use it
- Use bd for work that spans sessions or people: anything another session, agent or person may pick up, continue, or need to know about. File the issue before starting that work.
- For steps inside a single session, the built-in todo list is fine. Do not file an issue per small edit.
- Before ending a session: close what you finished (with evidence), file follow-ups you found, and report `git status`. Do not push, pull, or run `bd dolt push` unless the user asks.

## Practices (Eric's, for every repo)
- **File only actionable work.** Every issue needs a next action. Questions go to a person (owner label, or `human`), not into the backlog as tasks. Do not copy other people's to-dos from logs.
- **Every issue has an owner, two ways:** an assignee (`"Eric Lai"`, `Ben`, or a client such as `Daniel`) and the matching label (`eric`, `ben`, `client`). Unsure? Best guess plus label `owner-guess`. `bd list --no-assignee` must stay empty.
- **Identity:** Eric's sessions run as `BEADS_ACTOR="Eric Lai"`, Ben's as `BEADS_ACTOR="Ben"` (set in each person's ~/.zshenv). The actor must match the assignee to claim or close, so only claim and close issues assigned to the person you work for.
- **Decisions go to the repo's lead with the `human` label:** Ben in repos he leads (family-tv), Eric everywhere else. They answer with `bd human respond <id>`. Never decide for them and close it.
- **Describe when filing:** why it matters, where (file:line, job, log path), and how to tell it is done.
- **Claim before working** (`bd update <id> --claim`) so two sessions never take the same issue. In Herdr, the planner names one issue id per fork; the fork claims it and closes it or files follow-ups before it ends.
- **Close with evidence:** `bd close <id> --reason "<commit, log line, or decision>"`. No evidence: leave it open and say what you checked. Unsure if done or obsolete: ask instead of closing.
- **Check the newest state** (`origin/main`, latest brain/ notes and logs) before judging an issue.
- **Weekly triage** when asked: close what is done with evidence, list `human` items and anything without an owner.
- Do not edit `.beads/PRIME.md`; propose changes to Eric.

## Commands
- Find: `bd ready` (open, unblocked), `bd ready --assignee "Eric Lai"`, `bd list --status=in_progress`, `bd show <id>`, `bd search <text>`
- File: `bd create --title="..." --description="..." -t task|bug|feature|decision|chore -p 2 --assignee "Eric Lai" -l eric` (priority 0-4, 0 critical; `--parent=<id>` for a child)
- Work: `bd update <id> --claim`, `bd unclaim <id>`, `bd update <id> --notes="..."`, `bd dep add <issue> <blocker>`, `bd blocked`
- Finish: `bd close <id> [<id>...] --reason="..."`, `bd defer <id> --until=<date>`, `bd human list`
- Never use `bd edit` (it opens an editor and blocks). Never run `bd init` or `bd bootstrap` here: "database not found" means a missing login or a stopped server, not a missing backlog.
