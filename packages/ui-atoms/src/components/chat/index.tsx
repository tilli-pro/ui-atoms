// coss's `chat` kit (`.coss-base/chat/`, post-pin: every file is digest-pinned in
// scripts/coss/coss-lock.json with its own `provenance`). coss serves it as one file per
// part with no barrel of its own; this index is ours and re-exports every public part,
// type and hook flat, the house convention.

export {
  ChatBubble,
  type ChatBubbleProps,
  ChatBubbleReactions,
} from "./chat-bubble.js";
export {
  ChatCollapsibleMessage,
  type ChatCollapsibleMessageProps,
} from "./chat-collapsible-message.js";
export {
  ChatConversation,
  type ChatConversationProps,
} from "./chat-conversation.js";
export { ChatDatePill } from "./chat-date-pill.js";
export {
  ChatDeliveryIndicator,
  type ChatDeliveryIndicatorProps,
} from "./chat-delivery-indicator.js";
export {
  ChatJumpToLatestButton,
  type ChatJumpToLatestButtonProps,
} from "./chat-jump-to-latest-button.js";
export {
  type ChatMemberEntry,
  ChatMemberList,
  type ChatMemberListProps,
  ChatMemberSection,
  type ChatMemberSectionProps,
} from "./chat-members.js";
export { ChatMessage, type ChatMessageProps } from "./chat-message.js";
export {
  ChatMessageActionToolbar,
  type ChatMessageActionToolbarProps,
} from "./chat-message-actions.js";
export {
  ChatMessageBubble,
  type ChatMessageBubbleProps,
} from "./chat-message-bubble.js";
export {
  ChatMessageInfo,
  type ChatMessageInfoProps,
} from "./chat-message-info.js";
export {
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageFooter,
  ChatMessageHeader,
  ChatMessageLayout,
  type ChatMessageLayoutProps,
} from "./chat-message-layout.js";
export {
  ChatMessageText,
  type ChatMessageTextProps,
} from "./chat-message-text.js";
export {
  ChatReactionChip,
  type ChatReactionChipProps,
} from "./chat-reaction-chip.js";
export {
  ChatReactionPicker,
  type ChatReactionPickerProps,
} from "./chat-reaction-picker.js";
export {
  ChatReplyPreview,
  type ChatReplyPreviewProps,
  type ChatReplyTarget,
} from "./chat-reply-preview.js";
export {
  ChatReplyReference,
  type ChatReplyReferenceProps,
} from "./chat-reply-reference.js";
export {
  ChatEmptyState,
  type ChatEmptyStateProps,
  ChatLoadingState,
  ChatStatusBar,
} from "./chat-states.js";
export {
  ChatTypingIndicator,
  type ChatTypingIndicatorProps,
} from "./chat-typing-indicator.js";
export { ChatUnreadDivider } from "./chat-unread-divider.js";
export { useChatPopupDismissal } from "./hooks/use-chat-popup-dismissal.js";
export {
  type ChatScrollController,
  type ChatScrollOptions,
  useChatScroll,
} from "./hooks/use-chat-scroll.js";
export { splitChatMessagePreview } from "./lib/split-chat-message-preview.js";
