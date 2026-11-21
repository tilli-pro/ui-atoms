# Third-party notices

`@tilli.dev/ui-atoms` is MIT (see LICENSE). It contains code derived from, and depends on,
the works below. Notices are preserved as their licenses require.

## coss ui (component registry, `apps/ui/` of github.com/cosscom/ui, formerly cosscom/coss) — MIT

Components in `src/components/`, and the vendored libs and hooks in `src/lib/` and `src/hooks/`, are **re-based on** the coss ui registry (MIT) at a single
pinned revision: commit `b2336c45f2b7355c42678ce786b6f14d62b819be` of
`apps/ui/registry/default/`, dated 2026-11-17, fetched 2026-11-21 from
`https://coss.com/ui/r/<name>.json`. The exact bytes each component was derived from are
committed in this repository under `.coss-base/`, and `scripts/coss/coss-lock.json` records
a SHA-256 per file, so the derivation is reproducible rather than asserted: every one of the
86 locked files is byte-identical to the same path at that commit. The repository was
`cosscom/coss` when the first pin (`816348154874bbc0be230277c584cc38019b48b1`, 2026-09-16)
was taken; it has since been renamed to `cosscom/ui` with its history intact. At the first
pin the monorepo root was AGPL-3.0 with `apps/ui/` and `apps/origin/` carved out as MIT; at
the current pin the whole repository is MIT (see below). Upstream now authors the components
under `packages/ui/src/` and commits the registry build under `apps/ui/registry/`, which is
the only tree read here.

The calendar's optional time field takes its time parsing, typing format and list filtering
from the registry particle `p-calendar-25` (`apps/ui/registry/default/particles/p-calendar-25.tsx`,
also served as `https://coss.com/ui/r/p-calendar-25.json`) at the same pinned revision, SHA-256
`a64bbc30017583fbddaf6af961ead774de2f38ab0ade779dacfda649e3c5b50e`. Particles are not committed
under `.coss-base/`; this one is covered by this same MIT notice.

Eight components have no upstream counterpart in either registry and are not derived from
coss — `aspect-ratio`, `currency-input`, `form-root-error`, `number-ticker`,
`spinning-text`, `stepper`, `timeline`, `tree`. Two are derived from shadcn/ui
(`carousel`, `resizable`; see that section). Three more have a coss counterpart they are not
derived from yet: `number-field`, `toolbar` and `segmented-control`; the coss
file of each is committed under `.coss-base/` for reference only.

`composer` with its libs and hook (`src/lib/composer-*.ts`,
`src/hooks/use-composer-editor.ts`) and the `chat` kit (`src/components/chat/`, one registry
item of 23 files) joined the coss registry after the first pin. At the current pin they are
part of the tree and verified against it like every other file; `chat` is locked one entry
per served file under `.coss-base/chat/`.

The `segmented-control` *component* is tilli's own. coss's item of the same name was a cva
lib at the first pin and is a component at the current one
(`registry/default/ui/segmented-control.tsx`, committed as `.coss-base/segmented-control.tsx`).
`src/lib/segmented-control.ts` holds the four strings and records `tabs` takes from that
file, and nothing else is derived from it.

The agent skill in `.agents/skills/coss/` is coss documentation too: authored by cosscom,
`license: MIT` in its own frontmatter, vendored verbatim from `apps/ui/skills/coss/` at the
same pinned revision. It is covered by this same MIT notice.

At commit `b2336c45f2b7355c42678ce786b6f14d62b819be` the coss repository is MIT as a whole: its root `README.md` states
"This entire repository is licensed under the [MIT License](LICENSE)", and the root
`LICENSE` is reproduced verbatim below. (At the first pin there was no `LICENSE` inside
`apps/ui/`; the MIT designation was made by the root `README.md` and a `LICENSING.md`
that carved `apps/origin/` and `apps/ui/` out of an AGPL-3.0 default. Both designations
cover everything taken here.)

MIT License

Copyright (c) 2025 coss.com and Origin UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## shadcn/ui (component registry, `apps/v4/registry/` of github.com/shadcn-ui/ui) — MIT

Two components are derived from shadcn/ui: `carousel` (on `embla-carousel-react`) and
`resizable` (on `react-resizable-panels` 4.x). Both
were carried over from the pre-1.0 package and recorded as tilli's own until the 2026-11
refresh compared them with the registry. The registry bytes they are compared against are
committed under `.shadcn-base/` and digest-pinned in `scripts/shadcn/shadcn-lock.json`
(style `base-nova`, served from `https://ui.shadcn.com/r/styles/base-nova/<name>.json`,
fetched 2026-11-21):

- `carousel` — SHA-256 `64df310fc76336a5b1307bb736d5457fa3767393d4c5ff884851ccee568c8b6c`, generated from `apps/v4/registry/bases/base/ui/carousel.tsx`
  (last commit `c257f688cf4de7ec10cc1be84cad29cd4631182c`, 2026-09-04)
- `resizable` — SHA-256 `c45c4e1a32aefb83d60406366e2368b9d8a6e772406f8b964154e7202d6304f7`, generated from `apps/v4/registry/bases/base/ui/resizable.tsx`
  (last commit `c257f688cf4de7ec10cc1be84cad29cd4631182c`, 2026-09-04)

The shadcn registry serves generated files that exist at no commit verbatim, so the template's
last commit is provenance, not proof; the digest is the pin. `carousel` predates that base
and differs from it (lucide arrows and button sizing), so the base records lineage and is the
diff a later refresh starts from. `resizable` is ported from the pinned bytes and differs in
styling only: a grip handle with a lucide icon, and the focus ring and state colours of the
coss-based components.

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## @base-ui/react — MIT

Copyright (c) 2024 Material-UI SAS. Licensed under the MIT License
(https://github.com/mui/base-ui/blob/master/LICENSE).

## lucide (lucide-react) — ISC License

ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or
without fee is hereby granted, provided that the above copyright notice and this permission
notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL
THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY
DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE
OR PERFORMANCE OF THIS SOFTWARE.

## cva (class-variance-authority, 1.0.0-beta) — Apache License, Version 2.0

Copyright 2022 Joe Bell. Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable law
or agreed to in writing, software distributed under the License is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under the License.

## @daypicker/react — MIT License

Copyright (c) 2022 Giampaolo Bellavite. Licensed under the MIT License
(https://github.com/gpbl/react-day-picker/blob/main/LICENSE). Optional peer of `./calendar`.

## tailwind-merge — MIT License

Copyright (c) 2021 Dany Castillo. Licensed under the MIT License
(https://github.com/dcastil/tailwind-merge/blob/main/LICENSE.md).

## clsx — MIT License

Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com). Licensed under the MIT
License (https://github.com/lukeed/clsx/blob/master/license).

## tw-animate-css — MIT License

Copyright (c) 2025 Wombosvideo. Licensed under the MIT License
(https://github.com/Wombosvideo/tw-animate-css/blob/main/LICENSE).
