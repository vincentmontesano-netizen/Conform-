import { Sidebar } from '@/components/layout/Sidebar';
import { SubscriptionProvider } from '@/providers/SubscriptionContext';
import { ChatbotWidget } from '@/components/ui/ChatbotWidget';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="relative flex-1 overflow-auto">
          {/* Grain texture on main area */}
          <div className="grain pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative z-10 p-8 lg:p-10">{children}</div>

          {/* Widget RAG Mistral (Module 5A) */}
          <ChatbotWidget />
        </main>
      </div>
    </SubscriptionProvider>
  );
}
