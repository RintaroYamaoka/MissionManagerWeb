import { PageContent } from "@/components/PageContent";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="h-screen flex flex-col p-6 max-w-4xl mx-auto overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <PageContent />
      </div>
    </main>
  );
}
