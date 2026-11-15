import type { Metadata } from "next";
import LegalLayout from "@/components/site/LegalLayout";
import Bi from "@/components/site/Bi";

export const metadata: Metadata = {
  title: "Terms of Sale",
  alternates: { canonical: "/terms" },
};

const H = "pt-4 text-xl font-semibold text-white";

const en = (
  <>
    <h2 className={H}>1. Seller</h2>
    <p>
      Javad Emami, Medborgarplatsen 25, 118 72 Stockholm, Sweden. Phone: 073-560 45 93. You can also
      reach me through the contact form on this website.
    </p>
    <h2 className={H}>2. Products</h2>
    <p>
      The store sells digital files. Unless a product page says otherwise, a purchase gives you a
      personal, non-transferable licence to use the files. You may not resell or redistribute them.
    </p>
    <h2 className={H}>3. Prices and payment</h2>
    <p>
      Prices are shown in USDT. Payment is accepted only in USDT on the TRON network (TRC20), to the
      address shown at checkout. You must send the exact amount shown within 30 minutes. Payments sent
      on another network, or with a different amount, may not be detected and cannot always be
      recovered.
    </p>
    <h2 className={H}>4. Delivery</h2>
    <p>
      Files are available immediately after the payment is confirmed on the blockchain, in your account
      under My purchases. A receipt with the download link is also sent to your email address.
    </p>
    <h2 className={H}>5. Right of withdrawal</h2>
    <p>
      Delivery of digital content starts as soon as the payment is confirmed. By completing a purchase,
      you agree to immediate delivery and acknowledge that you may lose your right of withdrawal once
      the content is available to you.
    </p>
    <h2 className={H}>6. Refunds</h2>
    <p>See the Refund Policy page.</p>
    <h2 className={H}>7. Governing law</h2>
    <p>These terms are governed by Swedish law.</p>
  </>
);

const sv = (
  <>
    <h2 className={H}>1. Säljare</h2>
    <p>
      Javad Emami, Medborgarplatsen 25, 118 72 Stockholm, Sverige. Telefon: 073-560 45 93. Du kan också
      kontakta mig via kontaktformuläret på denna webbplats.
    </p>
    <h2 className={H}>2. Produkter</h2>
    <p>
      Butiken säljer digitala filer. Om inte produktsidan anger något annat ger köpet en personlig,
      icke överlåtbar licens att använda filerna. Du får inte sälja eller distribuera dem vidare.
    </p>
    <h2 className={H}>3. Priser och betalning</h2>
    <p>
      Priserna visas i USDT. Betalning tas endast emot i USDT på TRON-nätverket (TRC20), till adressen som
      visas i kassan. Du måste skicka exakt det belopp som visas inom 30 minuter. Betalningar som skickas
      på ett annat nätverk, eller med ett annat belopp, kan inte alltid upptäckas eller återställas.
    </p>
    <h2 className={H}>4. Leverans</h2>
    <p>
      Filerna blir tillgängliga direkt efter att betalningen bekräftats på blockkedjan, under Mina köp på
      ditt konto. Ett kvitto med nedladdningslänk skickas också till din e-postadress.
    </p>
    <h2 className={H}>5. Ångerrätt</h2>
    <p>
      Leverans av digitalt innehåll börjar så snart betalningen bekräftats. Genom att slutföra ett köp
      godkänner du omedelbar leverans och förstår att du kan förlora ångerrätten när innehållet är
      tillgängligt för dig.
    </p>
    <h2 className={H}>6. Återbetalningar</h2>
    <p>Se sidan Återbetalningspolicy.</p>
    <h2 className={H}>7. Tillämplig lag</h2>
    <p>Dessa villkor regleras av svensk lag.</p>
  </>
);

export default function TermsPage() {
  return (
    <LegalLayout title={{ en: "Terms of Sale", sv: "Köpvillkor" }} updated={{ en: "15 November 2026", sv: "15 november 2026" }}>
      <Bi en={en} sv={sv} />
    </LegalLayout>
  );
}
