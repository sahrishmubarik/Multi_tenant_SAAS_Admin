import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  passwordSchema,
  changePasswordSchema,
} from "../validations/validation.js";

export default function PasswordCard() {
  /* =========================
     PASSWORD VISIBILITY
  ========================= */

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================
     FORM DATA
  ========================= */
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  /* =========================
     UI STATE
  ========================= */

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  /* =========================
     FIELD VALIDATION ERRORS
  ========================= */

  const [errors, setErrors] = useState({});

  /* =========================
     DISABLE BUTTON
  ========================= */

  const isFormEmpty =
    !formData.currentPassword &&
    !formData.password &&
    !formData.confirmPassword;

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

    /* =========================
       CURRENT PASSWORD VALIDATION
    ========================= */

    if (name === "currentPassword") {
      const result = passwordSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          currentPassword: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          currentPassword: "",
        }));
      }
    }

    /* =========================
       NEW PASSWORD VALIDATION
    ========================= */

    if (name === "password") {
      const result = passwordSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          password: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          password: "",
        }));
      }

      /*
        New password changed,
        so validate confirm password again.
      */

      if (updatedFormData.confirmPassword) {
        const confirmResult = changePasswordSchema.safeParse(updatedFormData);

        const confirmError = confirmResult.error?.issues.find(
          (issue) => issue.path[0] === "confirmPassword",
        );

        setErrors((previous) => ({
          ...previous,
          confirmPassword: confirmError ? confirmError.message : "",
        }));
      }
    }

    /* =========================
       CONFIRM PASSWORD VALIDATION
    ========================= */

    if (name === "confirmPassword") {
      const result = changePasswordSchema.safeParse(updatedFormData);

      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.path[0] === "confirmPassword",
        );

        setErrors((previous) => ({
          ...previous,
          confirmPassword: confirmError ? confirmError.message : "",
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "",
        }));
      }
    }

    /* =========================
       CLEAR OLD MESSAGE
    ========================= */

    setMessage("");
    setMessageType("");
  }

  /* =========================
     CHANGE PASSWORD
  ========================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    /* =========================
       ZOD VALIDATION
    ========================= */

    const result = changePasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    /* =========================
       CLEAR VALIDATION ERRORS
    ========================= */

    setErrors({});

    /* =========================
       START LOADING
    ========================= */

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/v1/auth/change-password", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          old_password: formData.currentPassword,

          new_password: formData.password,

          confirm_password: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      /* =========================
         BACKEND ERROR
      ========================= */

      if (!response.ok) {
        setMessage(data.message || "Failed to change password.");

        setMessageType("error");

        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      setMessage(data.message || "Password changed successfully.");
      setToast("Password changed successfully!");
      setMessageType("success");

      localStorage.removeItem("token");
      localStorage.removeItem("workspaceId");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);

      /* =========================
         CLEAR FORM
      ========================= */

      setFormData({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Change password error:", error);

      setMessage("Something went wrong. Please try again.");

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
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
      {/* =========================
          HEADER
      ========================= */}

      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">Password</h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
        {/* =========================
            CURRENT PASSWORD
        ========================= */}

        <div>
          <label
            htmlFor="currentPassword"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Current password
          </label>

          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              type={showCurrentPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword((previous) => !previous)}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              aria-label={
                showCurrentPassword
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              <FontAwesomeIcon
                icon={showCurrentPassword ? faEyeSlash : faEye}
              />
            </button>
          </div>

          {/* Current password error */}

          {errors.currentPassword && (
            <p
              className="
                mt-1
                text-sm
                text-[var(--color-danger)]
              "
            >
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* =========================
            NEW PASSWORD
        ========================= */}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            New password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={showNewPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowNewPassword((previous) => !previous)}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
            >
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* New password error */}

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
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Confirm new password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type={showConfirmPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
              />
            </button>
          </div>

          {/* Confirm password error */}

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
            MESSAGE
        ========================= */}

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-center text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-[#fef2f2] text-[var(--color-danger)]"
            }`}
          >
            {message}
          </p>
        )}

        {/* =========================
            SUBMIT
        ========================= */}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || isFormEmpty}
            className="
              btn-primary
              px-4
              py-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white
                    border-t-transparent
                  "
                />
                Changing...
              </span>
            ) : (
              "Change password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// import { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { passwordSchema,changePasswordSchema } from "../../validations/validation.js";
// export default function PasswordCard() {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     currentPassword: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
// const [errors, setErrors] = useState("");
//   const [messageType, setMessageType] = useState("");
//   function handleChange(event) {
//     const { name, value } = event.target;
//      const updatedFormData = {
//            ...formData,
//            [name]: value,
//          };
//           setFormData(updatedFormData);
//        if (name === "currentPassword") {
//                const result = passwordSchema.safeParse(value);

//                if (!result.success) {
//                  setErrors((previous) => ({
//                    ...previous,
//                    password:
//                      result.error.issues[0].message,
//                  }));
//                } else {
//                  setErrors((previous) => ({
//                    ...previous,
//                    password: "",
//                  }));
//                }
//               }
//           /* =========================
//                 PASSWORD VALIDATION
//              ========================= */

//              if (name === "password") {
//                const result = passwordSchema.safeParse(value);

//                if (!result.success) {
//                  setErrors((previous) => ({
//                    ...previous,
//                    password:
//                      result.error.issues[0].message,
//                  }));
//                } else {
//                  setErrors((previous) => ({
//                    ...previous,
//                    password: "",
//                  }));
//                }

//                /*
//                  Password changed, so confirm password
//                  needs to be checked again.
//                */

//                if (updatedFormData.confirmPassword) {
//                  const confirmResult =
//                    changePasswordSchema.safeParse(updatedFormData);

//                  const confirmError =
//                    confirmResult.error?.issues.find(
//                      (issue) =>
//                        issue.path[0] === "confirmPassword"
//                    );

//                  setErrors((previous) => ({
//                    ...previous,
//                    confirmPassword: confirmError
//                      ? confirmError.message
//                      : "",
//                  }));
//                }
//              }

//              /* =========================
//                 CONFIRM PASSWORD VALIDATION
//              ========================= */

//              if (name === "confirmPassword") {
//                const result =
//                 changePasswordSchema.safeParse(updatedFormData);

//                if (!result.success) {
//                  const confirmError =
//                    result.error.issues.find(
//                      (issue) =>
//                        issue.path[0] === "confirmPassword"
//                    );

//                  if (confirmError) {
//                    setErrors((previous) => ({
//                      ...previous,
//                      confirmPassword:
//                        confirmError.message,
//                    }));
//                  }
//                } else {
//                  setErrors((previous) => ({
//                    ...previous,
//                    confirmPassword: "",
//                  }));
//                }
//              }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();

//     setMessage("");

//     // Frontend validation
//     // if (
//     //   !formData.currentPassword ||
//     //   !formData.password ||
//     //   !formData.confirmPassword
//     // ) {
//     //   setMessage("Please fill in all password fields.");
//     //   return;
//     // }
//     /* ZOD VALIDATION */
//  const result =changePasswordSchema.safeParse(formData);

//           if (!result.success) {
//             const fieldErrors = {};

//             result.error.issues.forEach((issue) => {
//               const fieldName = issue.path[0];

//               if (
//                 fieldName &&
//                 !fieldErrors[fieldName]
//               ) {
//                 fieldErrors[fieldName] =
//                   issue.message;
//               }
//             });

//             setErrors(fieldErrors);

//             return;
//           }

//           setErrors({});
//           setLoading(true);

//     try {

//       const token = localStorage.getItem("token");

//       const response = await fetch("/api/v1/auth/change-password", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           old_password: formData.currentPassword,
//           new_password: formData.password,
//           confirm_password: formData.confirmPassword,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.message || "Failed to change password.");
//         setMessageType("error");
//         return;
//       }

//       setMessage(data.message || "Password changed successfully.");
//       setMessageType("success");
//       setFormData({
//         currentPassword: "",
//         password: "",
//         confirmPassword: "",
//       });
//     } catch (error) {
//       console.error("Change password error:", error);
//       setMessage("Something went wrong. Please try again.");
//       setMessageType("error");
//     } finally {
//       setLoading(false);
//     }
//        setMessage("");
//       setMessageType("");
//   }

//   return (
//     <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
//       <div className="border-b border-[#e7e7e5] px-5 py-4">
//         <h2 className="text-[15px] font-semibold text-[#17181a]">Password</h2>

//         <p className="mt-1 text-[13px] text-[#66686d]">
//           Update your password to keep your account secure.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
//         {/* Current Password */}
//         <div>
//           <label
//             htmlFor="currentPassword"
//             className="mb-2 block text-[13px] font-medium text-[#252629]"
//           >
//             Current password
//           </label>

//           <div className="relative">
//             <input
//               id="currentPassword"
//               name="currentPassword"
//               value={formData.currentPassword}
//               onChange={handleChange}
//               type={showCurrentPassword ? "text" : "password"}
//               className="
//                 h-10
//                 w-full
//                 rounded-[9px]
//                 border border-[#dfdfdb]
//                 px-3 pr-11
//                 text-[14px]
//                 outline-none
//                 transition
//                 focus:border-[#aeb0b5]
//                 focus:ring-2
//                 focus:ring-[#eeeeec]
//               "
//             />

//             <button
//               type="button"
//               onClick={() => setShowCurrentPassword((previous) => !previous)}
//               className="
//                 absolute right-3 top-1/2
//                 -translate-y-1/2
//                 text-[var(--color-text-secondary)]
//                 transition-colors
//                 hover:text-[var(--color-primary)]

//               "
//               aria-label={
//                 showCurrentPassword
//                   ? "Hide current password"
//                   : "Show current password"
//               }
//             >
//               <FontAwesomeIcon
//                 icon={showCurrentPassword ? faEyeSlash : faEye}
//               />
//             </button>
//           </div>
//            {errors.currentPassword && (
//               <p
//                 className="
//                   mt-1
//                   text-sm
//                   text-[var(--color-danger)]
//                 "
//               >
//                 {errors.currentPassword}
//               </p>
//             )}
//         </div>

//         {/* New Password */}
//         <div>
//           <label
//             htmlFor="password"
//             className="mb-2 block text-[13px] font-medium text-[#252629]"
//           >
//             New password
//           </label>

//           <div className="relative">
//             <input
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               type={showNewPassword ? "text" : "password"}
//               className="
//                 h-10
//                 w-full
//                 rounded-[9px]
//                 border border-[#dfdfdb]
//                 px-3 pr-11
//                 text-[14px]
//                 outline-none
//                 transition
//                 focus:border-[#aeb0b5]
//                 focus:ring-2
//                 focus:ring-[#eeeeec]
//               "
//             />

//             <button
//               type="button"
//               onClick={() => setShowNewPassword((previous) => !previous)}
//               className="
//                 absolute right-3 top-1/2
//                 -translate-y-1/2
//                  text-[var(--color-text-secondary)]
//                 transition-colors
//                 hover:text-[var(--color-primary)]
//               "
//               aria-label={
//                 showNewPassword ? "Hide new password" : "Show new password"
//               }
//             >
//               <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
//             </button>
//           </div>
//            {errors.password && (
//               <p
//                 className="
//                   mt-1
//                   text-sm
//                   text-[var(--color-danger)]
//                 "
//               >
//                 {errors.password}
//               </p>
//             )}
//         </div>

//         {/* Confirm Password */}
//         <div>
//           <label
//             htmlFor="confirmPassword"
//             className="mb-2 block text-[13px] font-medium text-[#252629]"
//           >
//             Confirm new password
//           </label>

//           <div className="relative">
//             <input
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               type={showConfirmPassword ? "text" : "password"}
//               className="
//                 h-10
//                 w-full
//                 rounded-[9px]
//                 border border-[#dfdfdb]
//                 px-3 pr-11
//                 text-[14px]
//                 outline-none
//                 transition
//                 focus:border-[#aeb0b5]
//                 focus:ring-2
//                 focus:ring-[#eeeeec]
//               "
//             />

//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword((previous) => !previous)}
//               className="
//                 absolute right-3 top-1/2
//                 -translate-y-1/2
//                  text-[var(--color-text-secondary)]
//                 transition-colors
//                 hover:text-[var(--color-primary)]
//               "
//               aria-label={
//                 showConfirmPassword
//                   ? "Hide confirm password"
//                   : "Show confirm password"
//               }
//             >
//               <FontAwesomeIcon
//                 icon={showConfirmPassword ? faEyeSlash : faEye}
//               />
//             </button>
//           </div>
//            {errors.confirmPassword && (
//               <p
//                 className="
//                   mt-1
//                   text-sm
//                   text-[var(--color-danger)]
//                 "
//               >
//                 {errors.confirmPassword}
//               </p>
//             )}
//         </div>

//         {/* Message */}
//         {message && (
//           <p
//             className={`rounded-lg px-3 py-2 text-center text-sm ${
//               messageType === "success"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-[#fef2f2] text-[var(--color-danger)]"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         {/* Submit */}
//         <div className="flex justify-end pt-1">
//           <button
//             type="submit"
//             disabled={loading}
//             className="
//               btn-primary
//               px-4 py-2
//               disabled:cursor-not-allowed
//               disabled:opacity-60
//             "
//           >
//             {loading ? "Changing..." : "Change password"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
