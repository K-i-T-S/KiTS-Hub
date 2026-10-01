---
name: new-solution
description: Scaffold a seventh (or later) KiTS Hub solution as a Module Federation remote, cloned from an existing solution and wired into the workspace, root scripts and the shell.
disable-model-invocation: true
argument-hint: <kebab-name> e.g. "project-management"
---

# Scaffold a new KiTS Hub solution

Argument: `$ARGUMENTS` — the kebab-case folder name (e.g. `project-management`).

Read the `mf-contract` skill first; it holds the current names and ports.

## Derive names

- Folder: `solutions/<kebab-name>`
- Workspace package: `@kits-hub/<kebab-name>`
- MF name: camelCase of the folder (`projectManagement`)
- Port: next free port after the highest in the contract table (currently 4182 → 4183)
- Script suffix: a short alias (`pm`) — confirm it with the user

Show the derived values and get confirmation before writing anything.

## Steps

1. Copy `solutions/point-of-sale` (it has the correct `shared` singletons) to
   `solutions/<kebab-name>`, excluding `node_modules`, `dist`, `test-results`
   and any `*_REPORT.md` / `*_SUMMARY.md` files.
2. In the copy: set `name` in `package.json`; in `webpack.config.cjs` set the MF
   `name`, `devServer.port` and replace the POS `exposes` with `./App` and
   `./bootstrap` (plus pages the user asks for). Keep `shared` as-is.
3. Strip POS-specific pages and routes from `src/`, leaving a minimal
   `App.tsx` dashboard placeholder.
4. Root `package.json`: add `dev:<alias>`, `build:<alias>`, `test:<alias>`,
   `lint:<alias>` and `start:<alias>` scripts, and add `npm run dev:<alias>` /
   `npm run start:<alias>` to the `dev` and `start:prod` concurrently lists.
   The `solutions/*` workspace glob already covers the folder.
5. Shell: add `<mfName>: '<mfName>@http://localhost:<port>/remoteEntry.js'` to
   `remotes` in `shared-shell/webpack.config.cjs`, then add the route and
   navigation entry where the existing solutions are registered (search the
   shell `src/` for `pointOfSale/`).
6. Add a row for the new app to the table in
   `.claude/skills/mf-contract/SKILL.md`.
7. Run `npm install`, then build the new workspace and the shell. Report what
   passed and what didn't. Don't commit.
