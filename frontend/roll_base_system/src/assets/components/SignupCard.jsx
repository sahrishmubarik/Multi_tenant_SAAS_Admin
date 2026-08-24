// Import the core React component
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";

export default function SignupCard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  /* save the change values */
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if(!formData.name){
      setMessage("Username is required");
      return;
    }
     if(!formData.email){
      setMessage("Email is required");
      return;
    }
     if(!formData.password){
      setMessage("Password is required");
      return;
    }
     if(!formData.confirmPassword){
      setMessage("Confirm password is required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Password doesn't match.");
      return;
    }
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

     
      console.log("Data:", data);

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();

          setMessage(errorMessages.join(" "));
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Signup failed. Please try again.");
        }

        return;
      }

      setMessage("Account created successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log("Signup error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  }
  return (
    <div className="flex  items-center justify-center bg-[#E5EEE4] px-4 py-8">
      <div
        className="
        container-shadow
        w-full max-w-md
        rounded-xl
        border border-[var(--color-border)]
        bg-white
        p-3
        sm:p-8
      "
      >
        {/* Heading */}
        <div className="mb-7 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Get started
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Create Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Create your account and get started with RoleBase.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-sm
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          {/* Button */}
          <button type="submit" className="btn-primary mt-1 w-full">
            Create Account
          </button>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-[var(--color-danger)]">
              {message}
            </p>
          )}

          {/* Login */}
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="
              font-semibold
              text-[var(--color-primary)]
              hover:text-[var(--color-primary-hover)]
              hover:underline
            "
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
