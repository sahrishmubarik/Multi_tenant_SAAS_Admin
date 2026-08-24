import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
          throw new Error("Invitation token is missing");
        }

        // IMPORTANT:
        // Save token so it survives login/signup
        sessionStorage.setItem(
          "invitationToken",
          token
        );

        const response = await fetch(
          `http://localhost:3000/api/v1/workspace-invitation/details?token=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Invalid invitation"
          );
        }

        setInvitation(data.invitation);

        const authToken = localStorage.getItem("token");

        // User is already logged in
        if (authToken) {
          await acceptInvitation(authToken);
          return;
        }

        // User is NOT logged in
        if (data.userExists) {
          navigate(
            `/login?workspace-invitationToken=${encodeURIComponent(token)}`
          );
        } else {
          navigate(
            `/signup?workspace-invitationToken=${encodeURIComponent(token)}`
          );
        }

      } catch (error) {
        console.error("Invitation error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const acceptInvitation = async (authToken) => {
    const response = await fetch(
      `http://localhost:3000/api/v1/workspace-invitation/accept?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to accept invitation"
      );
    }

    // Token is no longer needed
    sessionStorage.removeItem("invitationToken");

    // Go to member/workspace page
    navigate(
      `/dashboard/members`
    );
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
          <h2 className="text-lg font-semibold">
            Invitation Error
          </h2>

          <p className="mt-2 text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return null;
}