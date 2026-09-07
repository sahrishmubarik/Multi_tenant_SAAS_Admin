
import { useState } from "react";
import { emailSchema, invitationSchema } from "../../validations/validation.js";

export default function InviteMemberCard({
  workspaceId,
  onInvitationSent,
  onShowToast,
}) {
  const [email, setEmail] = useState("");

  // Selected invitation role
  const [role, setRole] = useState("viewer");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Field-level validation errors
  const [errors, setErrors] = useState({});

  /* =========================
     HANDLE EMAIL INPUT CHANGE
  ========================= */

  function handleChange(event) {
    const { value } = event.target;

    setEmail(value);

    /* =========================
       EMAIL FIELD VALIDATION
    ========================= */

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

    // Clear old backend messages
    setError("");
    setMessage("");
  }

  /* =========================
     HANDLE ROLE CHANGE
  ========================= */

  function handleRoleChange(event) {
    const { value } = event.target;

    setRole(value);

    // Clear old validation/backend messages
    setErrors((previous) => ({
      ...previous,
      role: "",
    }));

    setError("");
    setMessage("");
  }

  /* =========================
     SEND INVITATION
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /* =========================
       VALIDATE FORM
    ========================= */

    const result = invitationSchema.safeParse({
      email,
      role,
    });

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

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/v1/workspace-invitation/${workspaceId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            email: result.data.email,
            role: result.data.role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Something went wrong while sending the invitation. Please try again.",
        );
      }

      /* =========================
         SUCCESS
      ========================= */

      setMessage("Invitation sent successfully.");

      // Reset form
      setEmail("");
      

      setErrors({
        email: "",
        role: "",
      });

      setTimeout(() => {
        setMessage("");
      }, 2000);

      onShowToast("Member invited successfully!");
      onInvitationSent();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      {/* =========================
          HEADER
      ========================= */}

      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Invite someone
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Send an invitation to someone who does not have access yet.
        </p>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end"
      >
        {/* =========================
            EMAIL
        ========================= */}

        <div className="flex-1">
          <label
            htmlFor="email"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="member@example.com"
            className="
              h-10
              w-full
              rounded-[9px]
              border
              border-[#dfdfdb]
              bg-white
              px-3
              text-[14px]
              text-[#252629]
              outline-none
              transition
              placeholder:text-[#aaa]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary-light)]
            "
          />

          {/* =========================
              EMAIL VALIDATION ERROR
          ========================= */}

          {errors.email && (
            <p
              className="
                mt-1
                mb-7
                text-sm
                text-[var(--color-danger)]
              "
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* =========================
            ROLE
        ========================= */}

        <div className="w-full sm:w-[170px]">
          <label
            htmlFor="role"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Role
          </label>

          <select
            id="role"
            name="role"
            value={role}
            onChange={handleRoleChange}
            className="
            cursor-pointer
              h-10
              w-full
              rounded-[9px]
              border
              border-[#dfdfdb]
              bg-white
              px-3
              text-[14px]
              text-[#252629]
              outline-none
              transition
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary-light)]
            "
          >
            <option value="viewer" >Viewer  </option>
            <option value="editor" className="hover:cursor-pointer">Editor</option>
            <option value="admin" className="hover:cursor-pointer">Admin</option>
          </select>

          {/* =========================
              ROLE VALIDATION ERROR
          ========================= */}

          {errors.role && (
            <p
              className="
                mt-1
                text-sm
                text-[var(--color-danger)]
              "
            >
              {errors.role}
            </p>
          )}
        </div>

        {/* =========================
            SEND INVITATION BUTTON
        ========================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            btn-primary
            px-5
            text-[13px]
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
              Sending invitation...
            </span>
          ) : (
            "Send invitation"
          )}
        </button>
      </form>

      {/* =========================
          ERROR / SUCCESS MESSAGE
      ========================= */}

      {(error || message) && (
        <div className="px-5 pb-5">
          {error && (
            <div
              className="
                rounded-[8px]
                bg-[var(--color-danger-bg)]
                px-3
                py-2
                text-[12px]
                text-[var(--color-danger)]
              "
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="
                rounded-[8px]
                bg-[var(--color-success-bg)]
                px-3
                py-2
                text-[12px]
                text-[var(--color-success)]
              "
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}








// import { useState } from "react";
// import { emailSchema, invitationSchema } from "../../validations/validation.js";

// export default function InviteMemberCard({
//   workspaceId,
//   onInvitationSent,
//   onShowToast,
// }) {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // Field-level validation errors
//   const [errors, setErrors] = useState({});

//   /* =========================
//      HANDLE INPUT CHANGE
//   ========================= */

//   function handleChange(event) {
//     const { value } = event.target;

//     // Email is a string, so store the value directly
//     setEmail(value);

//     /* =========================
//        EMAIL FIELD VALIDATION
//     ========================= */

//     const result = emailSchema.safeParse(value);

//     if (!result.success) {
//       setErrors((previous) => ({
//         ...previous,
//         email: result.error.issues[0].message,
//       }));
//     } else {
//       setErrors((previous) => ({
//         ...previous,
//         email: "",
//       }));
//     }

//     // Clear old backend messages
//     setError("");
//     setMessage("");
//   }

//   /* =========================
//      SEND INVITATION
//   ========================= */

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     /* =========================
//        VALIDATE FORM
//     ========================= */

//     const result = invitationSchema.safeParse({
//       email,
//     });

//     if (!result.success) {
//       const fieldErrors = {};

//       result.error.issues.forEach((issue) => {
//         const fieldName = issue.path[0];

//         if (fieldName && !fieldErrors[fieldName]) {
//           fieldErrors[fieldName] = issue.message;
//         }
//       });

//       setErrors(fieldErrors);

//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setError("");

//     try {
//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         `/api/v1/workspace-invitation/${workspaceId}`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },

//           body: JSON.stringify({
//             email: result.data.email,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Something went wrong while sending the invitation. Please try again.",
//         );
//       }

//       /* =========================
//          SUCCESS
//       ========================= */

//       setMessage("Invitation sent successfully.");

//       setEmail("");

//       setErrors({
//         email: "",
//       });
//       setTimeout(() => {
//         setMessage("");
//       }, 2000);
//       onShowToast("Member invited successfully!");
//       onInvitationSent();
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
//       {/* =========================
//           HEADER
//       ========================= */}

//       <div className="border-b border-[#e7e7e5] px-5 py-4">
//         <h2 className="text-[15px] font-semibold text-[#17181a]">
//           Invite someone
//         </h2>

//         <p className="mt-1 text-[13px] text-[#66686d]">
//           Send an invitation to someone who does not have access yet.
//         </p>
//       </div>

//       {/* =========================
//           FORM
//       ========================= */}

//       <form
//         onSubmit={handleSubmit}
//         className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end"
//       >
//         <div className="flex-1">
//           <label
//             htmlFor="email"
//             className="mb-2 block text-[13px] font-medium text-[#252629]"
//           >
//             Email
//           </label>

//           <input
//             id="email"
//             type="email"
//             name="email"
//             value={email}
//             onChange={handleChange}
//             placeholder="member@example.com"
//             className="
//               h-10
//               w-full
//               rounded-[9px]
//               border
//               border-[#dfdfdb]
//               bg-white
//               px-3
//               text-[14px]
//               text-[#252629]
//               outline-none
//               transition
//               placeholder:text-[#aaa]
//               focus:border-[var(--color-primary)]
//               focus:ring-2
//               focus:ring-[var(--color-primary-light)]
//             "
//           />

//           {/* =========================
//               EMAIL VALIDATION ERROR
//           ========================= */}

//           {errors.email && (
//             <p
//               className="
//                 mt-1
//                 text-sm
//                 text-[var(--color-danger)]
//                 mb-7
//               "
//             >
//               {errors.email}
//             </p>
//           )}
//         </div>

//         {/* =========================
//             SEND INVITATION BUTTON
//         ========================= */}

//         <button
//           type="submit"
//           disabled={loading}
//           className="
//             btn-primary
//             px-5
//             text-[13px]
//             disabled:cursor-not-allowed
//             disabled:opacity-60
//           "
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-2">
//               <span
//                 className="
//                   h-4
//                   w-4
//                   animate-spin
//                   rounded-full
//                   border-2
//                   border-white
//                   border-t-transparent
//                 "
//               />
//               Sending invitation...
//             </span>
//           ) : (
//             "Send invitation"
//           )}
//         </button>
//       </form>

//       {/* =========================
//           ERROR / SUCCESS MESSAGE
//       ========================= */}

//       {(error || message) && (
//         <div className="px-5 pb-5">
//           {error && (
//             <div
//               className="
//                 rounded-[8px]
//                 bg-[var(--color-danger-bg)]
//                 px-3
//                 py-2
//                 text-[12px]
//                 text-[var(--color-danger)]
//               "
//             >
//               {error}
//             </div>
//           )}

//           {message && (
//             <div
//               className="
//                 rounded-[8px]
//                 bg-[var(--color-success-bg)]
//                 px-3
//                 py-2
//                 text-[12px]
//                 text-[var(--color-success)]
//               "
//             >
//               {message}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useState } from "react";
// import { emailSchema,invitationSchema } from "../../validations/validation.js"
// export default function InviteMemberCard({
//   workspaceId, onInvitationSent,
// }) {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   function handleChange(event) {
//       event.preventDefault();
//     const { name, value } = event.target;

//     setEmail((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
// /* =========================
//        EMAIL FIELD VALIDATION
//     ========================= */
//    if (name === "email") {
//       const result = emailSchema.safeParse(value);

//       if (!result.success) {
//         setError((previous) => ({
//           ...previous,
//           email: result.error.issues[0].message,
//         }));
//       } else {
//         setError((previous) => ({
//           ...previous,
//           email: "",
//         }));
//       }
//     }

//   }

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//      const result = invitationSchema.safeParse({email});
//        if (!result.success) {
//            const errorMessages = result.error.issues.map(
//              (issue) => issue.message
//            );

//            setError(errorMessages.join(" "));
//            return;
//          }

//          setLoading(true);

//     try {
//       setLoading(true);
//       setMessage("");
//       setError("");

//       const token = localStorage.getItem("token");

//       const response = await fetch(
//   `/api/v1/workspace-invitation/${workspaceId}`,
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       email,
//     }),
//   },
// );

// const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Something went wrong while sending the invitation. Please try again.");
//       }

//       setMessage("Invitation sent successfully.");
//       setEmail("");

//       onInvitationSent();
//     } catch (error) {
//       // console.error("Invitation error:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
//       <div className="border-b border-[#e7e7e5] px-5 py-4">
//         <h2 className="text-[15px] font-semibold text-[#17181a]">
//           Invite someone
//         </h2>

//         <p className="mt-1 text-[13px] text-[#66686d]">
//           Send an invitation to someone who does not have access yet.
//         </p>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end"
//       >
//         <div className="flex-1">
//           <label className="mb-2 block text-[13px] font-medium text-[#252629]">
//             Email
//           </label>

//           <input
//             type="email"
//             value={email}
//             onChange={handleChange}
//             placeholder="member@example.com"
//             className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none transition placeholder:text-[#aaa] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
//           />
//         </div>

//         {/* <button
//           type="submit"
//           disabled={loading}
//           className="btn-primary px-5 text-[13px]"
//         >
//           {loading ? "Sending..." : "Send invitation"}
//         </button> */}
//       </form>

//       {(error || message) && (
//         <div className="px-5 pb-5">
//           {error && (
//             <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
//               {error}
//             </div>
//           )}

//           {message && (
//             <div className="rounded-[8px] bg-[var(--color-success-bg)] px-3 py-2 text-[12px] text-[var(--color-success)]">
//               {message}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
