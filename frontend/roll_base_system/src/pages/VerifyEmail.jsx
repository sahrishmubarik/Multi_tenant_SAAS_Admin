import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");

  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const token = searchParams.get("token");

    console.log("Token on frontend:", token);

    if (!token) {
      setMessage("Verification token is required.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Email verification failed.");
          return;
        }

        setMessage("Email verified successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Something went wrong. Please try again.");
      }
    }

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div
        className=" container-shadow w-full max-w-md  rounded-xl  border border-[var(--color-border)]  bg-white  p-8  text-center "
      >
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]">
          Email Verification
        </h1>

        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          {message}
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="btn-primary mt-6"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
