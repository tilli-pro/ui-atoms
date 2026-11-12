import type { NetworkStatus } from "../../mock/network.js";

export const networkStatusLabel: Record<NetworkStatus, string> = {
  connected: "Connected",
  invited: "Invited",
  not_invited: "Not invited",
};
