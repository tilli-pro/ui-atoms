# Visual snapshots

`apps/storybook/visual/__screenshots__/` holds one Playwright screenshot per
story × theme, **Linux-rendered**. They are regenerated only through CI's
`visual` job, dispatched manually:

```bash
gh workflow run ci.yml --ref <branch> -f update_snapshots=true
gh run list --workflow ci.yml --branch <branch> --limit 1   # note the <run-id>
gh run download <run-id> -n visual-screenshots -D apps/storybook/visual/__screenshots__
```

A local `pnpm --filter storybook visual:update` is for inspection only — it
renders on whatever OS the machine runs and those PNGs must never be
committed; macOS and Linux Chromium render fonts differently enough that a
macOS-captured set fails CI's `ubuntu-latest` runner. Commit only the PNGs a
`workflow_dispatch` run produced.

## Themes

Every story is captured in the neutral theme, in light and dark. The themes from
`@tilli.dev/themes` are captured on a subset listed as `THEMED` in `stories.spec.ts`: about
thirty stories in each of tilli and nudge, and the sidebar and spectrum stories in beacon.
Their files are named `<story>-<theme>-<mode>.png`. Add a story to `THEMED` when a component could look wrong on a
tinted surface in a way the token contrast tests would not catch.
