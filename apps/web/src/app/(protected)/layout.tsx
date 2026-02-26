import { Sidebar } from '@/components/layout/Sidebar';
import { SubscriptionProvider } from '@/providers/SubscriptionContext';
import { ChatbotWidget } from '@/components/ui/ChatbotWidget';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
}) {
  if (params) await params;
  return (
    <ErrorBoundary>
      <SubscriptionProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="relative flex-1 overflow-auto">
            {/* Grain texture on main area */}
            <div className="grain pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative z-10 p-8 lg:p-10">{children}</div>
            {/* Chatbot flottant - icone en bas a droite */}
            <ChatbotWidget />
          </main>
        </div>
      </SubscriptionProvider>
    </ErrorBoundary>
  );
}
