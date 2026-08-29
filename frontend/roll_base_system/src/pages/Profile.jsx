import { useNavigate } from "react-router-dom";
import PasswordCard from "../assets/components/PassWordCard";
import { useState, useEffect } from "react";
export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:3000/api/v1/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setProfile({
          name: data.user.name,
          email: data.user.email,
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  return (
    <main className=" bg-[#E5EEE4]">
      <div className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8 ">
        <div className="mx-auto w-full max-w-[825px]">
          <div className="border-b border-[#e5e5e5] pb-7">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6f7177]">
              ACCOUNT
            </p>

            <h1 className="mt-2 text-[22px] font-semibold leading-tight text-[#17181a]">
              Your profile
            </h1>

            <p className="mt-2 max-w-[620px] text-[14px] leading-5 text-[#5f6268]">
              Manage how you appear in this workspace, change your password, and
              control account access.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
            <div className="border-b border-[#e7e7e5] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#17181a]">
                Profile
              </h2>

              <p className="mt-1 text-[13px] text-[#66686d]">
                How you appear across the app and in audit history.
              </p>
            </div>

            <div className="space-y-5 px-5 py-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#252629]">
                  Name
                </label>

                <input
                  type="text"
                  value={profile.name}
                   disabled
                  className="
          h-10
          w-full
          rounded-[9px]
          border border-[#dfdfdb]
          bg-white
          px-3
          text-[14px]
             text-[#999b9f]
          outline-none
          transition
          focus:border-[#aeb0b5]
          focus:ring-2
          focus:ring-[#eeeeec]
        "
                />
              </div>

              {/* Email */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[#252629]">
                    Email
                  </label>
                </div>

                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="
          h-10
          w-full
          rounded-[9px]
          border border-[#dfdfdb]
          bg-[#fafafa]
          px-3
          text-[14px]
          text-[#999b9f]
          outline-none
        "
                />
              </div>
            </div>
          </div>

          {/* Password Card */}
          <PasswordCard />

          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
            <div className="border-b border-[#e7e7e5] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#17181a]">
                Session
              </h2>

              <p className="mt-1 text-[13px] text-[#66686d]">
                Manage your current account session.
              </p>
            </div>

            <div className="px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#252629]">
                    Current session
                  </p>

                  <p className="mt-1 text-[12px] text-[#7a7d84]">
                    You are currently signed in on this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="
          w-full
          rounded-[8px]
          border border-[#dededc]
          bg-white
          px-4 py-2
          text-[13px]
          font-medium
          text-[#252629]
          transition
          hover:bg-[#f7f7f5]
          sm:w-auto
        "
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
