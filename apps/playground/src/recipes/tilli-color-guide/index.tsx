import type { CSSProperties, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@tilli.dev/ui-atoms/alert";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import { Input } from "@tilli.dev/ui-atoms/input";
import { Label } from "@tilli.dev/ui-atoms/label";
import { Switch } from "@tilli.dev/ui-atoms/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tilli.dev/ui-atoms/tabs";
import { useTheme } from "@tilli.dev/ui-atoms/theme";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { InfoIcon } from "lucide-react";
import { contrast, formatOklch, type Oklch, toHex } from "./color.js";
import { Lockup, Mark } from "./mark.js";
import {
  blue,
  blueSteps,
  cyan,
  cyanSteps,
  type Mode,
  neutral,
  neutralSteps,
  tokens,
} from "./palette.js";
import { Chip, Ramp, Ratio } from "./swatch.js";

/**
 * The guide renders in the palette it describes: its root carries the tilli theme's token
 * utilities from ui-atoms for the current mode, so the parts below are the real components
 * in the real theme. Switch the theme from the control panel. The values listed on the
 * page come from ./palette.js, which mirrors `theme-tilli-light` / `theme-tilli-dark` in
 * packages/ui-atoms/src/styles/core.css; change both together.
 */
const THEME: Record<Mode, string> = {
  light: "theme-tilli-light theme-mode-light",
  dark: "theme-tilli-dark theme-mode-dark",
};

const BRAND_GRADIENT = {
  "--brand-gradient":
    "linear-gradient(in oklch 100deg, var(--brand-illustration), var(--brand))",
} as CSSProperties;

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
        {lead ? <p className="text-muted-foreground">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.8125rem]">
      {children}
    </code>
  );
}

interface Pairing {
  label: string;
  text: Oklch;
  surface: Oklch;
  /** 4.5 for text, 3 for large text and controls. */
  need: number;
  sample: string;
  why: string;
  /** The sample is a shape (a control edge, an icon), not text. */
  shape?: boolean;
}

const DO: Pairing[] = [
  {
    label: "White on blue 500",
    text: neutral[0],
    surface: blue[500],
    need: 4.5,
    sample: "Pay now",
    why: "The brand button, in both modes.",
  },
  {
    label: "Blue 500 on the light page",
    text: blue[500],
    surface: neutral[50],
    need: 4.5,
    sample: "View invoice",
    why: "Brand text and links on light.",
  },
  {
    label: "Blue 400 on the dark page",
    text: blue[400],
    surface: neutral[950],
    need: 4.5,
    sample: "View invoice",
    why: "Brand text and links on dark.",
  },
  {
    label: "Blue 500 fill on the dark page",
    text: blue[500],
    surface: neutral[950],
    need: 3,
    sample: "A control's edge",
    shape: true,
    why: "A control only needs 3:1 against its surroundings.",
  },
  {
    label: "Blue 600 on blue 100",
    text: blue[600],
    surface: blue[100],
    need: 4.5,
    sample: "Informational",
    why: "Tinted surface with its own text, light.",
  },
  {
    label: "Blue 300 on blue 900",
    text: blue[300],
    surface: blue[900],
    need: 4.5,
    sample: "Informational",
    why: "Tinted surface with its own text, dark.",
  },
];

const DONT: Pairing[] = [
  {
    label: "Blue 500 as text on dark",
    text: blue[500],
    surface: neutral[950],
    need: 4.5,
    sample: "View invoice",
    why: "Use blue 400 for text on dark.",
  },
  {
    label: "White on cyan 400",
    text: neutral[0],
    surface: cyan[400],
    need: 4.5,
    sample: "Pay now",
    why: "Cyan never sits behind text.",
  },
  {
    label: "Cyan 400 on the light page",
    text: cyan[400],
    surface: neutral[50],
    need: 3,
    sample: "An icon or border",
    shape: true,
    why: "Too faint on light even for an icon.",
  },
];

function PairingCard({ pairing }: { pairing: Pairing }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      {/* A specimen, not content: the "Avoid" ones fail on purpose. It is hidden from
          assistive technology and described by the label and ratio beneath it. */}
      <div
        aria-hidden="true"
        className="flex h-20 items-center justify-center px-3 font-medium"
        style={{
          backgroundColor: toHex(pairing.surface),
          color: toHex(pairing.text),
        }}
      >
        {pairing.shape ? (
          <span
            className="h-8 w-24 rounded-md border-2"
            style={{ borderColor: toHex(pairing.text) }}
          />
        ) : (
          pairing.sample
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">
            {pairing.label}
            <span className="sr-only">
              {pairing.shape
                ? `, shown as ${pairing.sample}`
                : `, sample text "${pairing.sample}"`}
            </span>
          </span>
          <Ratio
            need={pairing.need}
            value={contrast(pairing.text, pairing.surface)}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          {pairing.why} Needs {pairing.need}:1.
        </p>
      </div>
    </div>
  );
}

export default function TilliColorGuide() {
  const { resolvedTheme } = useTheme();
  const mode: Mode = resolvedTheme;
  const ink = mode === "light" ? neutral[950] : neutral[200];

  return (
    <main
      className={cn("min-h-screen bg-background text-foreground", THEME[mode])}
      style={BRAND_GRADIENT}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-6">
          <Lockup ink={ink} size="lg" />
          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="font-semibold text-4xl tracking-tight">
              Colour guide
            </h1>
            <p className="text-lg text-muted-foreground">
              One blue that carries every action, a cyan kept for illustration,
              and greys tinted to sit in the same family as the mark. This page
              is drawn in the palette it describes, in{" "}
              <strong className="font-medium text-foreground">{mode}</strong>{" "}
              mode. Switch the theme from the control panel to see the other.
            </p>
          </div>
        </header>

        <Section
          lead="OKLCH is the source of truth. Hex is derived from it for tools that need hex, never edited by hand."
          title="The standard"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>How a colour is written</CardTitle>
                <CardDescription>
                  Lightness and chroma to four decimals at most, hue to two.
                </CardDescription>
              </CardHeader>
              <CardPanel className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="size-12 shrink-0 rounded-md"
                    style={{ backgroundColor: toHex(blue[500]) }}
                  />
                  <div className="flex flex-col gap-1 font-mono">
                    <span>{formatOklch(blue[500])}</span>
                    <span className="text-muted-foreground uppercase">
                      {toHex(blue[500])}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  That precision is enough to land on one exact 8-bit colour:
                  the value above converts to the blue of the U mark, digit for
                  digit. Every hex on this page is computed from its OKLCH value
                  in the browser.
                </p>
              </CardPanel>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Why OKLCH</CardTitle>
                <CardDescription>
                  The three numbers mean what they say.
                </CardDescription>
              </CardHeader>
              <CardPanel>
                <ul className="flex list-disc flex-col gap-2 ps-5 text-sm">
                  <li>
                    <strong className="font-medium">Lightness</strong> is
                    perceptual. Two steps with the same lightness look equally
                    light, whatever their hue, so contrast is predictable.
                  </li>
                  <li>
                    <strong className="font-medium">Hue</strong> is held
                    constant down a ramp. Every blue here is <Code>266.12</Code>
                    ; a tint is the same colour, lighter.
                  </li>
                  <li>
                    <strong className="font-medium">Chroma</strong> is kept
                    inside sRGB, so the hex is exact and not a clipped stand-in.
                    A tile that had to be clipped says so.
                  </li>
                </ul>
              </CardPanel>
            </Card>
          </div>
        </Section>

        <Section
          lead="The brand colour and its tints and shades, all at the hue of the U mark's blue stroke. Press a tile to copy its OKLCH value."
          title="Blue"
        >
          <Ramp steps={blueSteps} />
        </Section>

        <Section
          lead="Greys with a faint blue cast. The lightest is the page, the darkest is the wordmark's ink, and step 200 is the wordmark on dark."
          title="Neutral"
        >
          <Ramp steps={neutralSteps} />
        </Section>

        <Section
          lead="The second stroke of the mark. It is an illustration colour, not an interface colour: it has no accent role, it never sits behind text, and on light surfaces it is too faint for text, icons or borders."
          title="Cyan"
        >
          <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
            <div className="grid grid-cols-3 gap-2">
              {cyanSteps.map((step) => (
                <div
                  className="flex flex-col overflow-hidden rounded-lg border bg-card"
                  key={step.step}
                >
                  <span
                    className="h-20"
                    style={{ backgroundColor: toHex(step.color) }}
                  />
                  <span className="flex flex-col gap-0.5 p-2">
                    <span className="font-heading font-semibold text-sm">
                      {step.step}
                    </span>
                    <span className="font-mono text-[0.6875rem] leading-tight">
                      {formatOklch(step.color)}
                    </span>
                    <span className="font-mono text-[0.6875rem] text-muted-foreground uppercase">
                      {toHex(step.color)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
              <div
                className="flex h-32 items-center justify-center"
                style={{ backgroundImage: "var(--brand-gradient)" }}
              >
                <Mark
                  className="h-16 w-auto"
                  left={neutral[0]}
                  right={blue[100]}
                />
              </div>
              <div className="flex flex-col gap-1 p-3 text-sm">
                <span className="font-medium">The brand gradient</span>
                <p className="text-muted-foreground">
                  Cyan 400 into blue 500, mixed in OKLCH so the middle stays
                  vivid. Use it behind the mark and in illustration. Text does
                  not go on it: its cyan end cannot carry white.
                </p>
                <Code>
                  linear-gradient(in oklch 100deg, var(--brand-illustration),
                  var(--brand))
                </Code>
              </div>
            </div>
          </div>
        </Section>

        <Section
          lead="Components never use a ramp step directly. They use these roles, and each role points at one step per mode."
          title="Tokens"
        >
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Token</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Light</th>
                  <th className="px-3 py-2 font-medium">Dark</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr className="border-b last:border-b-0" key={token.name}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[0.8125rem]">
                      --{token.name}
                      {token.proposed ? (
                        <Badge className="ms-2" variant="info">
                          new
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {token.role}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Chip color={token.light} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Chip color={token.dark} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          lead="The ratios are computed from the values above. Text needs 4.5:1; large text and the edge of a control need 3:1."
          title="Pairings"
        >
          <h3 className="font-medium text-lg">Use</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DO.map((pairing) => (
              <PairingCard key={pairing.label} pairing={pairing} />
            ))}
          </div>
          <h3 className="font-medium text-lg">Avoid</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DONT.map((pairing) => (
              <PairingCard key={pairing.label} pairing={pairing} />
            ))}
          </div>
        </Section>

        <Section
          lead="The U mark keeps both strokes. The wordmark is set in Sora, in neutral 950 on light and neutral 200 on dark."
          title="The mark"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div
              className="flex h-40 items-center justify-center rounded-lg border"
              style={{ backgroundColor: toHex(neutral[50]) }}
            >
              <Lockup ink={neutral[950]} size="lg" />
            </div>
            <div
              className="flex h-40 items-center justify-center rounded-lg border"
              style={{ backgroundColor: toHex(neutral[950]) }}
            >
              <Lockup ink={neutral[200]} size="lg" />
            </div>
            <div
              className="flex h-40 items-center justify-center rounded-lg"
              style={{ backgroundColor: toHex(blue[500]) }}
            >
              <Mark
                className="h-20 w-auto"
                left={neutral[0]}
                right={blue[200]}
              />
            </div>
          </div>
          <p className="max-w-2xl text-muted-foreground text-sm">
            On the brand blue the mark drops its colours: white in front, blue
            200 behind. Blue and cyan are only 2.2:1 apart, so the fold reads by
            shape; never rely on the two to tell interface states apart.
          </p>
        </Section>

        <Section
          lead="ui-atoms parts wearing the tokens above. Blue appears where something is the main action or is informational, and nowhere else."
          title="In the interface"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  One brand button per view. Everything else stays neutral.
                </CardDescription>
              </CardHeader>
              <CardPanel className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="brand">Pay now</Button>
                  <Button>Save</Button>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="secondary">Export</Button>
                  <Button variant="ghost">Skip</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  "Pay now" is the <Code>brand</Code> button variant.{" "}
                  <a
                    className="font-medium text-brand-foreground underline underline-offset-4"
                    href="#/recipes/tilli-color-guide"
                  >
                    A brand link
                  </a>{" "}
                  uses <Code>--brand-foreground</Code>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="success">Paid</Badge>
                  <Badge variant="warning">Due soon</Badge>
                  <Badge variant="error">Overdue</Badge>
                  <Badge variant="outline">Draft</Badge>
                </div>
              </CardPanel>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
                <CardDescription>
                  Checked and selected states are neutral; the focus ring is
                  blue.
                </CardDescription>
              </CardHeader>
              <CardPanel className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="guide-email">Email</Label>
                  <Input
                    id="guide-email"
                    placeholder="name@example.com"
                    type="email"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <Label>
                    <Checkbox defaultChecked={true} />
                    Remember me
                  </Label>
                  <Label>
                    <Switch defaultChecked={true} />
                    Autopay
                  </Label>
                </div>
                <Tabs defaultValue="open">
                  <TabsList>
                    <TabsTab value="open">Open</TabsTab>
                    <TabsTab value="paid">Paid</TabsTab>
                    <TabsTab value="all">All</TabsTab>
                  </TabsList>
                  <TabsPanel
                    className="text-muted-foreground text-sm"
                    value="open"
                  >
                    Three invoices are open.
                  </TabsPanel>
                  <TabsPanel
                    className="text-muted-foreground text-sm"
                    value="paid"
                  >
                    Twelve invoices are paid.
                  </TabsPanel>
                  <TabsPanel
                    className="text-muted-foreground text-sm"
                    value="all"
                  >
                    Fifteen invoices in total.
                  </TabsPanel>
                </Tabs>
              </CardPanel>
            </Card>
          </div>
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>Info is the brand blue</AlertTitle>
            <AlertDescription>
              There is no separate informational blue. Two near-identical blues
              with different meanings could not be told apart.
            </AlertDescription>
          </Alert>
        </Section>

        {/* Retired colours: hidden for now, kept for when the list is wanted again.
            Restore the `retired` import from ./palette.js with it.
        <Section
          lead="Colours in use today that this guide replaces."
          title="Retired"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {retired.map((item) => (
              <div
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                key={item.hex}
              >
                <span
                  className="size-10 shrink-0 rounded-md"
                  style={{ backgroundColor: item.hex }}
                />
                <div className="flex flex-col text-sm">
                  <span className="font-mono text-xs uppercase line-through">
                    {item.hex}
                  </span>
                  <span>{item.where}</span>
                  <span className="text-muted-foreground">
                    Use {item.use} instead
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
        */}
      </div>
    </main>
  );
}
