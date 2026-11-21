import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tilli.dev/ui-atoms/empty";
import { Construction } from "lucide-react";
import { type GapId, gaps } from "../gaps.js";
import { GapBadge } from "./cells.js";

export function GapPlaceholder({
  id,
  message,
}: {
  id: GapId;
  message: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        <EmptyTitle>{gaps[id].concept}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <GapBadge id={id} />
      </EmptyContent>
    </Empty>
  );
}
