import { Badge } from "@tilli.dev/ui-atoms/badge";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Pear", value: "pear" },
];

export function App() {
  return (
    <main className="flex flex-col gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
        </CardHeader>
        <CardPanel className="flex items-center gap-4">
          <Button>Primary</Button>
          <Badge variant="info">badge</Badge>
          <Checkbox aria-label="Agree" />
          <Select items={fruits}>
            <SelectTrigger aria-label="Fruit">
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectPopup>
              {fruits.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </CardPanel>
      </Card>
    </main>
  );
}
