import { USDT_TRC20_CONTRACT } from "@/lib/crypto";

export type TronscanTransfer = {
  transaction_id: string;
  to_address: string;
  contract_address: string;
  quant: string;
  block_ts: number;
  confirmed: boolean;
  finalResult: string;
  revert: boolean;
};

const BASE_URL = process.env.TRONSCAN_BASE_URL ?? "https://apilist.tronscanapi.com";

// Incoming USDT transfers to `address` since `sinceMs` (unix ms), confirmed only.
export async function fetchIncomingUsdt(address: string, sinceMs: number): Promise<TronscanTransfer[]> {
  const params = new URLSearchParams({
    toAddress: address,
    direction: "in",
    contract_address: USDT_TRC20_CONTRACT,
    start_timestamp: String(sinceMs),
    confirm: "0",
    limit: "50",
  });

  const headers: Record<string, string> = {};
  if (process.env.TRONSCAN_API_KEY) headers["TRON-PRO-API-KEY"] = process.env.TRONSCAN_API_KEY;

  const res = await fetch(`${BASE_URL}/api/token_trc20/transfers?${params}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Tronscan responded ${res.status}`);

  const json = await res.json();
  return (json.token_transfers ?? []) as TronscanTransfer[];
}
