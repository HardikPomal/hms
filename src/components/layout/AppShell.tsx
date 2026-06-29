import BottomNav from "./BottomNav";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppShell({
  children,
  title,
  showBack,
  showSearch,
  rightAction,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-dark-base-50">
      <Header
        title={title}
        showBack={showBack}
        showSearch={showSearch}
        rightAction={rightAction}
      />
      <main className="flex-1 overflow-y-auto pb-safe">
        <div className="max-w-lg mx-auto px-4 py-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
