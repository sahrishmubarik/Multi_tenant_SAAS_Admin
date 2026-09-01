
import {
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  nameSchema,
  emailSchema,
  passwordSchema,
  signupSchema,
} from "../../validations/validation.js";

export default function SignupCard() {
  const defaultFormValue = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(
    defaultFormValue
  );

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");

  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  function handleChange(event) {
    const { name, value } = event.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    // Clear backend message when user starts typing
    setMessage("");

    /* =========================
       NAME VALIDATION
    ========================= */

    if (name === "name") {
      const result = nameSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          name: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          name: "",
        }));
      }
    }

    /* =========================
       EMAIL VALIDATION
    ========================= */

    if (name === "email") {
      const result = emailSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          email: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          email: "",
        }));
      }
    }

    /* =========================
       PASSWORD VALIDATION
    ========================= */

    if (name === "password") {
      const result = passwordSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          password:
            result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          password: "",
        }));
      }

      /*
        Password changed, so confirm password
        needs to be checked again.
      */

      if (updatedFormData.confirmPassword) {
        const confirmResult =
          signupSchema.safeParse(updatedFormData);

        const confirmError =
          confirmResult.error?.issues.find(
            (issue) =>
              issue.path[0] === "confirmPassword"
          );

        setErrors((previous) => ({
          ...previous,
          confirmPassword: confirmError
            ? confirmError.message
            : "",
        }));
      }
    }

    /* =========================
       CONFIRM PASSWORD VALIDATION
    ========================= */

    if (name === "confirmPassword") {
      const result =
        signupSchema.safeParse(updatedFormData);

      if (!result.success) {
        const confirmError =
          result.error.issues.find(
            (issue) =>
              issue.path[0] === "confirmPassword"
          );

        if (confirmError) {
          setErrors((previous) => ({
            ...previous,
            confirmPassword:
              confirmError.message,
          }));
        }
      } else {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "",
        }));
      }
    }
  }

  /* =========================
     SIGNUP
  ========================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setToast("");

    /* =========================
       ZOD VALIDATION
    ========================= */

    const result =
      signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (
          fieldName &&
          !fieldErrors[fieldName]
        ) {
          fieldErrors[fieldName] =
            issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});
    setLoading(true);

    try {
      /* =========================
         CREATE ACCOUNT
      ========================= */

      const response = await fetch(
        "/api/v1/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(result.data),
        }
      );

      const data = await response.json();

      console.log(
        "Signup response status:",
        response.status
      );

      console.log(
        "Signup response body:",
        data
      );

      /* =========================
         SIGNUP BACKEND ERROR
      ========================= */

      if (!response.ok) {
        if (data.errors) {
          const errorMessages =
            Object.values(data.errors).flat();

          setMessage(
            errorMessages.join(" ")
          );
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage(
            "Signup failed. Please try again."
          );
        }

        return;
      }

      /* =========================
         ACCOUNT CREATED
      ========================= */

      /*
        Signup was successful.

        Now call the email verification
        endpoint.
      */

      const verificationResponse =
        await fetch(
          "/api/v1/auth/email-verification-token",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email: result.data.email,
            }),
          }
        );

      const verificationData =
        await verificationResponse.json();

      console.log(
        "Verification response status:",
        verificationResponse.status
      );

      console.log(
        "Verification response body:",
        verificationData
      );

      /* =========================
         VERIFICATION EMAIL ERROR
      ========================= */

      if (!verificationResponse.ok) {
        setMessage(
          verificationData.message ||
            "Account created, but verification email could not be sent."
        );

        return;
      }

      /* =========================
         COMPLETE SUCCESS
      ========================= */

      setFormData(defaultFormValue);

      setErrors({});

      setToast(
        "Account created! Verification email sent."
      );

      /*
        Show toast for 1 second,
        then navigate to login.
      */

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
        bg-[#E5EEE4]
        px-4
        py-8
      "
    >

      {/* =========================
          SUCCESS TOAST
      ========================= */}

      {toast && (
        <div
          className="
            fixed
            top-5
            right-5
            z-50
            rounded-lg
            bg-[var(--color-success)]
            px-5
            py-3
            text-sm
            font-medium
            text-white
            shadow-lg
          "
        >
          {toast}
        </div>
      )}

      <div
        className="
          container-shadow
          w-full
          max-w-md
          rounded-xl
          border
          border-[var(--color-border)]
          bg-white
          p-6
          sm:p-8
        "
      >

        {/* =========================
            HEADING
        ========================= */}

        <div className="mb-7 text-center">

          <p
            className="
              mb-1
              text-sm
              font-medium
              text-[var(--color-primary)]
            "
          >
            Get started
          </p>

          <h1
            className="
              text-2xl
              font-bold
              text-[var(--color-text-primary)]
            "
          >
            Create Account
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[var(--color-text-secondary)]
            "
          >
            Create your account and get started
            with RoleBase.
          </p>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* =========================
              NAME
          ========================= */}

          <div>

            <label
              htmlFor="name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
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
                h-10
                w-full
                rounded-lg
                border
                border-[var(--color-border)]
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

            {errors.name && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.name}
              </p>
            )}

          </div>

          {/* =========================
              EMAIL
          ========================= */}

          <div>

            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
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
                h-10
                w-full
                rounded-lg
                border
                border-[var(--color-border)]
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

            {errors.email && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.email}
              </p>
            )}

          </div>

          {/* =========================
              PASSWORD
          ========================= */}

          <div>

            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[var(--color-border)]
                  bg-white
                  px-3
                  pr-12
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
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon
                  icon={
                    showPassword
                      ? faEyeSlash
                      : faEye
                  }
                />
              </button>

            </div>

            {errors.password && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.password}
              </p>
            )}

          </div>

          {/* =========================
              CONFIRM PASSWORD
          ========================= */}

          <div>

            <label
              htmlFor="confirmPassword"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
            >
              Confirm Password
            </label>

            <div className="relative">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm your password"
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[var(--color-border)]
                  bg-white
                  px-3
                  pr-12
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
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-[var(--color-text-secondary)]
                  hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon
                  icon={
                    showConfirmPassword
                      ? faEyeSlash
                      : faEye
                  }
                />
              </button>

            </div>

            {errors.confirmPassword && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.confirmPassword}
              </p>
            )}

          </div>

          {/* =========================
              SIGNUP BUTTON
          ========================= */}

          <button
            type="submit"
            disabled={loading}
            className="
              btn-primary
              mt-1
              w-full
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          {/* =========================
              BACKEND ERROR
          ========================= */}

          {message && (
            <p
              className="
                text-center
                text-sm
                text-[var(--color-danger)]
              "
            >
              {message}
            </p>
          )}

          {/* =========================
              LOGIN
          ========================= */}

          <p
            className="
              text-center
              text-sm
              text-[var(--color-text-secondary)]
            "
          >
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


// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useState } from "react";

// import { signupSchema } from "../../validations/validation";

// export default function SignupCard() {

// const defaultFormValue ={name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",}
//       const [formData, setFormData] = useState(defaultFormValue);
//   const [showPassword, setShowPassword] =
//     useState(false);

//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState(false);

//   const [message, setMessage] = useState("");
//   const [Error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* =========================
//      HANDLE CHANGE
//   ========================= */

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setError("");
//     setMessage("");
//   }

//   /* =========================
//      SIGNUP
//   ========================= */

//   async function handleSubmit(event) {
//     event.preventDefault();

//     setError("");
//     setMessage("");

//     /* ZOD VALIDATION */

//     const result = signupSchema.safeParse(formData);

//     if (!result.success) {
//       const errorMessages = result.error.issues.map(
//         (issue) => issue.message
//       );

//       setError(errorMessages.join(" "));
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         "/api/v1/auth/signup",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(result.data),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         if (data.errors) {
//           const errorMessages =
//             Object.values(data.errors).flat();

//           setError(errorMessages.join(" "));
//         } else if (data.message) {
//           setError(data.message);
//         } else {
//           setError(
//             "Signup failed. Please try again."
//           );
//         }

//         return;
//       }

 

//       setMessage(
//         "Account created successfully!"
//       );

//       setFormData(defaultFormValue);
//     } catch (error) {
//       console.error("Signup error:", error);

//       setError(
//         "Something went wrong. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex items-center justify-center bg-[#E5EEE4] px-4 py-8">

//       <div
//         className="
//           container-shadow
//           w-full max-w-md
//           rounded-xl
//           border border-[var(--color-border)]
//           bg-white
//           p-3
//           sm:p-8
//         "
//       >

//         {/* Heading */}

//         <div className="mb-7 text-center">

//           <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
//             Get started
//           </p>

//           <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
//             Create Account
//           </h1>

//           <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
//             Create your account and get started with RoleBase.
//           </p>

//         </div>

//         {/* Form */}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-5"
//         >

//           {/* Name */}

//           <div>

//             <label
//               htmlFor="name"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Name
//             </label>

//             <input
//               id="name"
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter your name"
//               className="
//                 h-10 w-full
//                 rounded-lg
//                 border border-[var(--color-border)]
//                 bg-white
//                 px-3
//                 text-sm
//                 text-[var(--color-text-primary)]
//                 outline-none
//                 transition
//                 placeholder:text-[var(--color-text-muted)]
//                 focus:border-[var(--color-primary)]
//                 focus:ring-2
//                 focus:ring-[var(--color-primary-light)]
//               "
//             />

//           </div>

//           {/* Email */}

//           <div>

//             <label
//               htmlFor="email"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Email
//             </label>

//             <input
//               id="email"
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               className="
//                 h-10 w-full
//                 rounded-lg
//                 border border-[var(--color-border)]
//                 bg-white
//                 px-3
//                 text-sm
//                 text-[var(--color-text-primary)]
//                 outline-none
//                 transition
//                 placeholder:text-[var(--color-text-muted)]
//                 focus:border-[var(--color-primary)]
//                 focus:ring-2
//                 focus:ring-[var(--color-primary-light)]
//               "
//             />

//           </div>

//           {/* Password */}

//           <div>

//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Password
//             </label>

//             <div className="relative">

//               <input
//                 id="password"
//                 type={
//                   showPassword
//                     ? "text"
//                     : "password"
//                 }
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//                 className="
//                   h-10 w-full
//                   rounded-lg
//                   border border-[var(--color-border)]
//                   bg-white
//                   px-3 pr-12
//                   text-sm
//                   text-[var(--color-text-primary)]
//                   outline-none
//                   transition
//                   placeholder:text-[var(--color-text-muted)]
//                   focus:border-[var(--color-primary)]
//                   focus:ring-2
//                   focus:ring-[var(--color-primary-light)]
//                 "
//               />

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowPassword(
//                     (previous) => !previous
//                   )
//                 }
//                 className="
//                   absolute right-3 top-1/2
//                   -translate-y-1/2
//                   text-sm
//                   text-[var(--color-text-secondary)]
//                   hover:text-[var(--color-primary)]
//                 "
//               >
//                 <FontAwesomeIcon
//                   icon={
//                     showPassword
//                       ? faEyeSlash
//                       : faEye
//                   }
//                 />
//               </button>

//             </div>

//           </div>

//           {/* Confirm Password */}

//           <div>

//             <label
//               htmlFor="confirmPassword"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Confirm Password
//             </label>

//             <div className="relative">

//               <input
//                 id="confirmPassword"
//                 type={
//                   showConfirmPassword
//                     ? "text"
//                     : "password"
//                 }
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Confirm your password"
//                 className="
//                   h-10 w-full
//                   rounded-lg
//                   border border-[var(--color-border)]
//                   bg-white
//                   px-3 pr-12
//                   text-sm
//                   text-[var(--color-text-primary)]
//                   outline-none
//                   transition
//                   placeholder:text-[var(--color-text-muted)]
//                   focus:border-[var(--color-primary)]
//                   focus:ring-2
//                   focus:ring-[var(--color-primary-light)]
//                 "
//               />

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowConfirmPassword(
//                     (previous) => !previous
//                   )
//                 }
//                 className="
//                   absolute right-3 top-1/2
//                   -translate-y-1/2
//                   text-sm
//                   text-[var(--color-text-secondary)]
//                   hover:text-[var(--color-primary)]
//                 "
//               >
//                 <FontAwesomeIcon
//                   icon={
//                     showConfirmPassword
//                       ? faEyeSlash
//                       : faEye
//                   }
//                 />
//               </button>

//             </div>

//           </div>

//           {/* Button */}

//           <button
//             type="submit"
//             disabled={loading}
//             className="
//               btn-primary
//               mt-1
//               w-full
//               disabled:cursor-not-allowed
//               disabled:opacity-60
//             "
//           >
//             {loading
//               ? "Creating account..."
//               : "Create Account"}
//           </button>

//           {/* Message */}

//           {(Error || message) && (
//             <p
//               className={`text-center text-sm ${
//                 Error
//                   ? "text-[var(--color-danger)]"
//                   : "text-[var(--color-success)]"
//               }`}
//             >
//               {Error || message}
//             </p>
//           )}

//           {/* Login */}

//           <p className="text-center text-sm text-[var(--color-text-secondary)]">

//             Already have an account?{" "}

//             <a
//               href="/login"
//               className="
//                 font-semibold
//                 text-[var(--color-primary)]
//                 hover:text-[var(--color-primary-hover)]
//                 hover:underline
//               "
//             >
//               Login
//             </a>

//           </p>

//         </form>

//       </div>

//     </div>
//   );
// }