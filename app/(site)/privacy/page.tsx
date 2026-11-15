import type { Metadata } from "next";
import LegalLayout from "@/components/site/LegalLayout";
import Bi from "@/components/site/Bi";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

const H = "pt-4 text-xl font-semibold text-white";

const en = (
  <>
    <h2 className={H}>1. Controller</h2>
    <p>Javad Emami, Medborgarplatsen 25, 118 72 Stockholm, Sweden. Phone: 073-560 45 93.</p>
    <h2 className={H}>2. What I collect</h2>
    <ul className="list-disc space-y-1 pl-6">
      <li>Account data from sign-in: email address and name, handled by Clerk.</li>
      <li>Orders and purchases: product, amount, status, and the blockchain transaction ID.</li>
      <li>Support tickets: the messages you write and your email address.</li>
    </ul>
    <h2 className={H}>3. Service providers</h2>
    <p>
      Clerk (sign-in), MongoDB Atlas (database), Supabase (file storage), Resend (sending emails), Vercel
      (hosting), and Tronscan (reading public blockchain transactions).
    </p>
    <h2 className={H}>4. Why I use this data</h2>
    <p>
      To deliver the products you buy, answer your support requests, send receipts, and meet my
      accounting obligations. Blockchain transactions are public by nature.
    </p>
    <h2 className={H}>5. Retention</h2>
    <p>
      Order and accounting records are kept for seven years, as required by Swedish bookkeeping law.
      Other data is kept as long as your account exists.
    </p>
    <h2 className={H}>6. Your rights</h2>
    <p>
      You can ask for access to, correction of, or deletion of your personal data, and you can object to
      processing, using the contact form on this website or by phone. You can also complain to the
      Swedish Authority for Privacy Protection (IMY).
    </p>
  </>
);

const sv = (
  <>
    <h2 className={H}>1. Personuppgiftsansvarig</h2>
    <p>Javad Emami, Medborgarplatsen 25, 118 72 Stockholm, Sverige. Telefon: 073-560 45 93.</p>
    <h2 className={H}>2. Vilka uppgifter jag samlar in</h2>
    <ul className="list-disc space-y-1 pl-6">
      <li>Kontouppgifter vid inloggning: e-postadress och namn, hanterade av Clerk.</li>
      <li>Beställningar och köp: produkt, belopp, status och blockkedjans transaktions-ID.</li>
      <li>Supportärenden: meddelandena du skriver och din e-postadress.</li>
    </ul>
    <h2 className={H}>3. Tjänsteleverantörer</h2>
    <p>
      Clerk (inloggning), MongoDB Atlas (databas), Supabase (fillagring), Resend (e-postutskick), Vercel
      (hosting) och Tronscan (läsning av offentliga blockkedjetransaktioner).
    </p>
    <h2 className={H}>4. Varför jag använder uppgifterna</h2>
    <p>
      För att leverera produkterna du köper, besvara dina supportärenden, skicka kvitton och uppfylla mina
      bokföringsskyldigheter. Blockkedjetransaktioner är offentliga till sin natur.
    </p>
    <h2 className={H}>5. Lagringstid</h2>
    <p>
      Order- och bokföringsuppgifter sparas i sju år, enligt svensk bokföringslag. Övriga uppgifter sparas
      så länge ditt konto finns.
    </p>
    <h2 className={H}>6. Dina rättigheter</h2>
    <p>
      Du kan begära tillgång till, rättelse av eller radering av dina personuppgifter, och du kan invända
      mot behandlingen, via kontaktformuläret på denna webbplats eller per telefon. Du kan också lämna
      klagomål till Integritetsskyddsmyndigheten (IMY).
    </p>
  </>
);

export default function PrivacyPage() {
  return (
    <LegalLayout title={{ en: "Privacy Policy", sv: "Integritetspolicy" }} updated={{ en: "15 November 2026", sv: "15 november 2026" }}>
      <Bi en={en} sv={sv} />
    </LegalLayout>
  );
}
