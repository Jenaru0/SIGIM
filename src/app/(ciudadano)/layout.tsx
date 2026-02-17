import HeaderPublico from "@/components/layout/HeaderPublico";
import FooterPublico from "@/components/layout/FooterPublico";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderPublico />
      <main className="flex-1">{children}</main>
      <FooterPublico />
    </div>
  );
}
