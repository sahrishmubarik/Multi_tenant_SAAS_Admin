import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        if (!token) {
          console.log("token dose not exist");
          throw new Error("Invitation token is missing");
        }

        // IMPORTANT:
        // Save token so it survives login/signup
        sessionStorage.setItem("invitationToken", token);

        const data = await api.get(
          `/workspace-invitation/details?token=${encodeURIComponent(token)}`,
          { auth: false },
        );

        setInvitation(data.invitation);

        const authToken = localStorage.getItem("token");

        console.log(authToken);
        // User is already logged in
        if (authToken) {
          try {
            await acceptInvitation(authToken);
            return;
          } catch (error) {
            if (error.message === "Invalid or expired token") {
              localStorage.removeItem("token");
            } else {
              throw error;
            }
          }
        }
        // User is NOT logged in
        if (data.userExists) {
          navigate(
            `/login?workspace-invitationToken=${encodeURIComponent(token)}`,
          );
          acceptInvitation(authToken);
        } else {
          navigate(
            `/signup?workspace-invitationToken=${encodeURIComponent(token)}`,
          );
          acceptInvitation(authToken);
        }
      } catch (error) {
        // console.error("Invitation error:", {error});
        setError(error.message);
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    await api.post(
      `/workspace-invitation/accept?token=${encodeURIComponent(token)}`,
      undefined,
      { skipAuthRedirect: true },
    );

    // Token is no longer needed
    sessionStorage.removeItem("invitationToken");

    // Go to member/workspace page
    navigate(`/dashboard/members`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading invitation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Invitation Error</h2>

          <p className="mt-2 text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
