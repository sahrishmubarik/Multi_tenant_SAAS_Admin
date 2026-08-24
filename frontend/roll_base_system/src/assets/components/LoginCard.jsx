import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
export default function LoginCard() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.email)  {
      setMessage("Email is required.");
      return;
    }
    if(!formData.password){
      setMessage("Password is required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();

          setMessage(errorMessages.join(" "));
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Login failed. Please try again.");
        }

        return;
      }
      /* Save JWT token for valid user */
      localStorage.setItem("token", data.token);
      setMessage("Login successful!");
      navigate("/dashboard", { replace: true });
      // Optional: clear form after successful signup
      setFormData({
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage("Login error:", error);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (!formData.email) {
      setMessage("Email is  required.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/auth/forget-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setMessage("Reset link sent to your email!");
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center  bg-[#E5EEE4] px-6 mt-4">
      <div
        className="
        container-shadow
        w-full max-w-md
        rounded-xl
        border border-[var(--color-border)]
        bg-white
        p-6
        sm:p-8
      "
      >
        {/* Heading */}
        <div className="mb-7 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Welcome back
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Sign in to RoleBase
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Pick up where you left off.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="
              h-10 w-full
              rounded-lg
              border border-[var(--color-border)]
              bg-white
              px-3
              text-sm
              text-[var(--color-text-primary)]
              outline-none
              transition
              placeholder:text-[var(--color-text-muted)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary-light)]
            "
             
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                h-10 w-full
                rounded-lg
                border border-[var(--color-border)]
                bg-white
                px-3 pr-12
                text-sm
                text-[var(--color-text-primary)]
                outline-none
                transition
                placeholder:text-[var(--color-text-muted)]
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary-light)]
              "
                
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-sm
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="
              cursor-pointer
              text-sm 
              text-[var(--color-primary)]
              transition-colors
              hover:text-[var(--color-primary-hover)]
              hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            >
              {loading ? "Sending..." : "Forgot?"}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="
            btn-primary
            w-full
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          >
            Login
          </button>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-[var(--color-danger)]">
              {message}
            </p>
          )}

          {/* Signup */}
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="
              font-semibold
              text-[var(--color-primary)]
              hover:text-[var(--color-primary-hover)]
              hover:underline
            "
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
