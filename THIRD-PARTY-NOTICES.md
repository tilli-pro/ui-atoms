# Third-party notices

`@tilli.dev/ui-atoms` is MIT (see LICENSE). It contains code derived from, and depends on,
the works below. Notices are preserved as their licenses require.

## coss ui (component registry, `apps/ui/` of github.com/cosscom/coss) — MIT

Components in `src/components/`, and the vendored lib in `src/lib/`, are **re-based on** the coss ui registry (MIT) at a single
pinned revision: commit `816348154874bbc0be230277c584cc38019b48b1` of
`apps/ui/registry/default/ui`, dated 2026-09-16, fetched 2026-09-20 from
`https://coss.com/ui/r/<name>.json`. The exact bytes each component was derived from are
committed in this repository under `.coss-base/`, and `scripts/coss/coss-lock.json` records
a SHA-256 per file, so the derivation is reproducible rather than asserted. The coss monorepo
root is AGPL-3.0; only `apps/ui/` and `apps/origin/` are MIT per the repository's README and
LICENSING.md, and nothing outside `apps/ui/` is used here.

The calendar's optional time field takes its time parsing, typing format and list filtering
from the registry particle `p-calendar-25` (`apps/ui/registry/default/particles/p-calendar-25.tsx`,
also served as `https://coss.com/ui/r/p-calendar-25.json`) at the same pinned revision, SHA-256
`a64bbc30017583fbddaf6af961ead774de2f38ab0ade779dacfda649e3c5b50e`. Particles are not committed
under `.coss-base/`; this one is covered by this same MIT notice.

Eleven components have no coss counterpart and are not derived from it — `aspect-ratio`,
`carousel`, `currency-input`, `form-root-error`, `number-ticker`, `resizable`,
`segmented-control`, `spinning-text`, `stepper`, `timeline`, `tree` — and four more
(`number-field`, `sheet`, `sidebar`, `toolbar`) are not derived from it yet.

The `segmented-control` *component* is tilli's own. The unrelated coss registry item of the
same name is a cva lib, not a component; it is vendored separately as
`src/lib/segmented-control.ts`, derived from `registry/default/lib/segmented-control.ts` at
the same pinned revision, committed under `.coss-base/lib/` and digest-pinned in
`coss-lock.json` under the key `lib/segmented-control`.

The agent skill in `.agents/skills/coss/` is coss documentation too: authored by cosscom,
`license: MIT` in its own frontmatter, vendored verbatim from `apps/ui/skills/coss/` at the
same pinned revision. It is covered by this same MIT notice.

At commit `816348154874bbc0be230277c584cc38019b48b1` the coss repository ships **no `LICENSE`
file inside `apps/ui/`** and states no copyright line for the MIT-licensed directories. The
MIT designation is made by the repository's root `README.md` and `LICENSING.md`, both quoted
verbatim below as the source of the carve-out, followed by the text of the MIT License they
designate.

Upstream `README.md`, section "Licensing" (verbatim, fetched at commit
`816348154874bbc0be230277c584cc38019b48b1`):

> ## Licensing
>
> This repository uses a mixed licensing approach. The default license for this project is [AGPLv3.0](LICENSE).
>
> - **MIT**: The `apps/origin/` and `apps/ui/` directories are licensed under their original MIT license
> - **AGPLv3**: All other directories are licensed under the GNU Affero General Public License v3.0
>
> For detailed information, see our [Licensing documentation](LICENSING.md).

Upstream `LICENSING.md` (verbatim, fetched at commit
`816348154874bbc0be230277c584cc38019b48b1`):

> # Licensing
>
> This repository uses a mixed licensing approach. The default license for this project is [AGPLv3.0](LICENSE).
>
> ## MIT
>
> The following directory and their subdirectories are licensed under their original
>
> ```
> apps/origin/
> apps/ui/
> ```

The MIT License so designated, in its standard text:

MIT License

Copyright (c) coss.com contributors (github.com/cosscom/coss, `apps/ui/`)

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
