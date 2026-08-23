import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleInvitation = async () => {
      const invitationToken = searchParams.get("token");

      if (!invitationToken) {
        setError("Invitation token is missing.");
        setLoading(false);
        return;
      }

      try {
        
        //  First check whether the invitation is valid and whether the invited email already has an account.
      
        const response = await fetch(
          `http://localhost:3000/api/v1/workspace/invitation/details?token=${encodeURIComponent(
            invitationToken
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Invalid invitation."
          );
        }

        /*
         * User already has an account
         */
        if (data.userExists) {
          const authToken = localStorage.getItem("token");

          /*
           * User is already logged in.
           * Accept invitation immediately.
           */
          if (authToken) {
            await acceptInvitation(
              invitationToken,
              authToken,
              data.workspaceId
            );
            return;
          }

          /*
           * User has account but isn't logged in.
           * Send to login.
           */
          navigate(
            `/login?invitationToken=${encodeURIComponent(
              invitationToken
            )}`
          );

          return;
        }

        /*
         * User doesn't have account.
         * Send to signup.
         */
        navigate(
          `/signup?invitationToken=${encodeURIComponent(
            invitationToken
          )}&email=${encodeURIComponent(data.email)}`
        );
      } catch (error) {
        console.error("Invitation error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    handleInvitation();
  }, [navigate, searchParams]);

  const acceptInvitation = async (
    invitationToken,
    authToken,
    workspaceId
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/workspace/invitation/accept?token=${encodeURIComponent(
          invitationToken
        )}`,
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
          data.message || "Failed to accept invitation."
        );
      }

      /*
       * Invitation accepted successfully.
       */
      navigate(`/members?workspaceId=${workspaceId}`);
    } catch (error) {
      console.error("Accept invitation error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4]">
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#252629]">
            Checking invitation...
          </p>

          <p className="mt-2 text-[13px] text-[#77797e]">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-6">
        <div className="w-full max-w-[450px] rounded-[18px] border border-red-200 bg-white p-6">
          <h1 className="text-[18px] font-semibold text-red-700">
            Invitation problem
          </h1>

          <p className="mt-2 text-[13px] text-[#66686d]">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="btn-primary mt-5 px-4 py-2"
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  return null;
}