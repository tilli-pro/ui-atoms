import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tilli.dev/ui-atoms/table";

const INVOICES = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  {
    id: "INV003",
    status: "Unpaid",
    method: "Bank Transfer",
    amount: "$350.00",
  },
];

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

function InvoiceTable() {
  return (
    <Table style={{ width: "500px" }}>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>{inv.id}</TableCell>
            <TableCell>{inv.status}</TableCell>
            <TableCell>{inv.method}</TableCell>
            <TableCell>{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const Default: Story = {
  render: () => <InvoiceTable />,
};

export const EmptyTable: Story = {
  render: () => (
    <Table style={{ width: "500px" }}>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={4}
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--muted-foreground)",
            }}
          >
            No invoices found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

const LARGE_DATASET = Array.from({ length: 20 }, (_, i) => ({
  id: `INV${String(i + 1).padStart(3, "0")}`,
  status: ["Paid", "Pending", "Unpaid"][i % 3],
  method: ["Credit Card", "PayPal", "Bank Transfer", "ACH"][i % 4],
  amount: `$${((i + 1) * 47.5).toFixed(2)}`,
}));

export const LargeDataset: Story = {
  render: () => (
    <div
      aria-label="Invoices"
      role="region"
      style={{ maxHeight: "300px", overflowY: "auto", width: "550px" }}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs to be keyboard-reachable (WCAG 2.1.1) — the W3C's own fix for axe's scrollable-region-focusable, which this story was failing before tabIndex was added
      tabIndex={0}
    >
      <Table>
        <TableCaption>All invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {LARGE_DATASET.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.id}</TableCell>
              <TableCell>{inv.status}</TableCell>
              <TableCell>{inv.method}</TableCell>
              <TableCell>{inv.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <Table style={{ width: "500px" }}>
      <TableCaption>Select a row to view details</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((inv, idx) => (
          <TableRow
            key={inv.id}
            style={
              idx === 1
                ? { background: "var(--accent)", fontWeight: 600 }
                : undefined
            }
          >
            <TableCell>{inv.id}</TableCell>
            <TableCell>{inv.status}</TableCell>
            <TableCell>{inv.method}</TableCell>
            <TableCell>{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
