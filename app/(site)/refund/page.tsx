import type { Metadata } from "next";
import LegalLayout from "@/components/site/LegalLayout";
import Bi from "@/components/site/Bi";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund" },
};

const H = "pt-4 text-xl font-semibold text-white";

const en = (
  <>
    <h2 className={H}>When you can get a refund</h2>
    <ul className="list-disc space-y-1 pl-6">
      <li>The file is faulty or cannot be opened.</li>
      <li>The file is clearly different from what the product page describes.</li>
      <li>You were charged twice for the same order.</li>
    </ul>
    <h2 className={H}>How to ask</h2>
    <p>
      Open a support ticket from My account within 14 days of purchase. Describe the problem and, if
      possible, mention the order date and product name. I reply within 24 hours.
    </p>
    <h2 className={H}>What is not covered</h2>
    <p>
      Refunds are not given for change of mind after the file has been downloaded, except where the law
      requires it.
    </p>
    <h2 className={H}>Crypto payments</h2>
    <p>
      If you send the wrong amount or use the wrong network, contact me with the transaction ID. I will
      review each case, but funds sent to the wrong network cannot always be recovered.
    </p>
    <h2 className={H}>Refund method</h2>
    <p>
      Approved refunds are sent back in USDT on TRON (TRC20) to the address you provide, minus any network
      fee that cannot be avoided.
    </p>
  </>
);

const sv = (
  <>
    <h2 className={H}>När du kan få en återbetalning</h2>
    <ul className="list-disc space-y-1 pl-6">
      <li>Filen är felaktig eller kan inte öppnas.</li>
      <li>Filen skiljer sig tydligt från vad produktsidan beskriver.</li>
      <li>Du debiterades två gånger för samma order.</li>
    </ul>
    <h2 className={H}>Så här ansöker du</h2>
    <p>
      Öppna ett supportärende från Mitt konto inom 14 dagar efter köpet. Beskriv problemet och nämn gärna
      orderdatum och produktnamn om möjligt. Jag svarar inom 24 timmar.
    </p>
    <h2 className={H}>Vad som inte omfattas</h2>
    <p>
      Återbetalning ges inte om du ångrar dig efter att filen har laddats ner, såvida inte lagen kräver
      det.
    </p>
    <h2 className={H}>Kryptobetalningar</h2>
    <p>
      Om du skickar fel belopp eller använder fel nätverk, kontakta mig med transaktions-ID. Jag granskar
      varje fall, men medel som skickats till fel nätverk kan inte alltid återställas.
    </p>
    <h2 className={H}>Återbetalningsmetod</h2>
    <p>
      Godkända återbetalningar skickas tillbaka i USDT på TRON (TRC20) till den adress du anger, minus
      eventuella nätverksavgifter som inte kan undvikas.
    </p>
  </>
);

export default function RefundPage() {
  return (
    <LegalLayout title={{ en: "Refund Policy", sv: "Återbetalningspolicy" }} updated={{ en: "15 November 2026", sv: "15 november 2026" }}>
      <Bi en={en} sv={sv} />
    </LegalLayout>
  );
}
