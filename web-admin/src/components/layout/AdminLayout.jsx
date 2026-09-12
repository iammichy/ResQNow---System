import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout({
  children,
  activePage,
  onNavigate,
  onLogout,
  onAddManualReport,

  // RBAC
  currentUser,
  can,
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#8346F2] via-[#4F7DF3] to-[#16BFA8] p-[2px]">
      <div className="flex h-full w-full overflow-hidden bg-[#FFF8ED]">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onAddManualReport={onAddManualReport}
          // RBAC
          currentUser={currentUser}
          can={can}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar currentUser={currentUser} />

          <section className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
