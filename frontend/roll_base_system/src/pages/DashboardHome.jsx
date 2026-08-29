export default function DashboardHome() {
  return (
    <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[1000px]">

        <div className="rounded-[18px] border border-[#dededc] bg-white p-8 container-shadow">

          <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-primary)]">
            DASHBOARD
          </p>

          <h1 className="mt-2 text-[28px] font-semibold text-[#17181a]">
            Welcome to RoleBase
          </h1>

          <p className="mt-3 max-w-[600px] text-[14px] leading-6 text-[#66686d]">
            Manage your workspaces, team members, roles, and permissions
            from one place.
          </p>

        </div>

      </div>
    </main>
  );
}