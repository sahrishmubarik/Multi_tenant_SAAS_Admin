import Header from "../assets/components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import Footer from "../assets/components/Footer";

export default function Index() {
  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-[#E5EEE4] px-6 py-12">
        {/* Hero Section */}
        <div className="text-center">
          <p className="text-[var(--color-primary)] sm:text-1xl md:text-1xl">
            <FontAwesomeIcon icon={faShieldHalved} size="lg" /> Secure,
            Scalable, Built for Teams.
          </p>

          <h1 className="mx-auto mt-4 max-w-[600px] text-4xl font-extrabold text-black sm:text-4xl md:text-5xl">
            Multi-Tenant Access Made Simple.
          </h1>

          <p className="mx-auto mt-4 max-w-[600px] text-[#7a7d84] sm:text-1xl">
            Manage organizations, workspaces, members, and permissions from one
            secure control plane.
          </p>

          <div className="mt-5 flex items-center justify-center gap-4">
            <a href="/signup" className="btn-primary px-5 py-2">
              Get Started 
            </a>

            <a
              href="/login"
              className="btn-secondary group text-[#67696e] hover:text-white"
            >
              Login
            
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-7 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap lg:gap-8">
          {/* Organizations */}
          <div className="container-shadow min-h-48 w-[280px] rounded-[20px] border border-[#dededc] bg-white p-6 text-center">
            <h1 className="mb-3 font-extrabold text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faBuilding} size="lg" />
            </h1>

            <h2 className="mb-2 mt-2 font-bold text-[#17181a]">
              Organizations Access
            </h2>

            <p className="mt-2 text-[#7a7d84]">
              Manage company-level membership and roles.
            </p>
          </div>

          {/* Workspace */}
          <div className="container-shadow min-h-48 w-[280px] rounded-[20px] border border-[#dededc] bg-white p-6 text-center">
            <h1 className="mb-3 font-extrabold text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faUserGroup} size="lg" />
            </h1>

            <h2 className="mb-2 mt-2 font-bold text-[#17181a]">Workspace</h2>

            <p className="mt-2 text-[#7a7d84]">
              Control access to specific teams and projects.
            </p>
          </div>

          {/* Permissions */}
          <div className="container-shadow min-h-48 w-[280px] rounded-[20px] border border-[#dededc] bg-white p-6 text-center">
            <h1 className="mb-3 font-extrabold text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faBuilding} size="lg" />
            </h1>

            <h2 className="mb-2 mt-2 font-bold text-[#17181a]">Permissions</h2>

            <p className="mt-2 text-[#7a7d84]">
              Define what users can actually do.
            </p>
          </div>
        </div>
      </div>

      {/* How it works / Why RoleBase */}
      <section className="w-full bg-[#E5EEE4] px-6 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-extrabold text-black sm:text-3xl md:text-3xl">
            Everything You Need to Manage Access
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[#7a7d84]">
            RoleBase gives your team a centralized way to manage users, roles,
            workspaces, and permissions without unnecessary complexity.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Centralized Control */}
            <div className="container-shadow rounded-[20px] border border-[#dededc] bg-white p-6 text-left">
              <h2 className="text-center font-bold text-[#17181a]">
                Centralized Control
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-[#7a7d84]">
                Manage your organizations, members, and access rules from one
                secure control plane.
              </p>
            </div>

            {/* Role-Based Access */}
            <div className="container-shadow rounded-[20px] border border-[#dededc] bg-white p-6 text-left">
              <h2 className="text-center font-bold text-[#17181a]">
                Role-Based Access
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-[#7a7d84]">
                Define clear roles and permissions so every user gets the access
                they need.
              </p>
            </div>

            {/* Built to Scale */}
            <div className="container-shadow rounded-[20px] border border-[#dededc] bg-white p-6 text-left">
              <h2 className="text-center font-bold text-[#17181a]">
                Built to Scale
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-[#7a7d84]">
                Keep access management simple as your teams, workspaces, and
                organizations grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
