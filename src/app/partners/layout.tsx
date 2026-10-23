import { JsonLd } from "@/components/JsonLd";
import { serviceJsonLd, serviceMetadata } from "@/lib/seo";

export const metadata = serviceMetadata("partners");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd("partners")} />
      {children}
    </>
  );
}
