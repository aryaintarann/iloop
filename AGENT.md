## IMPORTANT

- ALWAYS USE CONTEXT7 BEFORE MAKE ANY CHANGE

- ALWAYS USE SKILLS BEFORE MAKE ANY CHANGE

- NEVER PUT SENSITIVE DATA ON THE FRONT END AND GITHUB

- ALWAYS USE TASTE SKILLS FOR FRONT END

- ALWAYS USE /pontail ultra

- Always use the appropriate skills; for example, if you want to write code in Go, look for the relevant Go skills.

For UI, copy, people, mobile layout, or code comments work, read [`antislop.md`](http://antislop.md) (core) and then the skill for the task:

- UI / visual: `skills/antislop-ui/[SKILL.md](http://SKILL.md)`

- Copy &amp; text: `skills/antislop-copywriting/[SKILL.md](http://SKILL.md)`

- People: `skills/antislop-human/[SKILL.md](http://SKILL.md)`

- Mobile / responsive: `skills/antislop-layoutmobile/[SKILL.md](http://SKILL.md)`

- Code comments: `skills/antislop-code/[SKILL.md](http://SKILL.md)`

Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.

Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.

If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.

To update antislop later: download [`antislop.md`](http://antislop.md) again, or run `npx antislop-ai --update` if it was installed as skill folders.