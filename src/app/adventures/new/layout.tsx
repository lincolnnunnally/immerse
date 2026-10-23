import { serviceMetadata } from "@/lib/seo";

export const metadata = serviceMetadata("share");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
