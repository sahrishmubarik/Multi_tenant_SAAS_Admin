export default function AuthHeader() {
  return (
  <header className="w-full border-b border-[#dededc] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.08)]">
  <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-6 sm:px-8">

    {/* Logo */}
    <div className="flex justify-start">
      <a href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
          RB
        </div>

        <span className="text-xl font-bold text-[#17181a]">
          RoleBase
        </span>
      </a>
    </div>

    {/* Center Content */}
    <div className="hidden text-center sm:block">
      <p className="text-[12px] font-medium text-[#66686d]">
        Secure access management for modern teams
      </p>
    </div>

    {/* Empty Right Side */}
    <div></div>

  </div>
</header>
  );
}