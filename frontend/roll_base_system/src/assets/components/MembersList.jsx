
import { useState } from "react";
import DeleteMemberModal from "./DeleteMemberModal";

function RoleBadge({ role }) {
  const roleStyles = {
    owner:
      "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
    admin:
      "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
    editor:
      "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
    viewer:
      "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        roleStyles[role] ||
        "bg-[var(--color-inherited-bg)] text-[var(--color-inherited)]"
      }`}
    >
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </span>
  );
}

export default function MembersList({
  members,
  loading,
  workspaceId,
  onMemberChanged,
}) {
  const [deleteMember, setDeleteMember] = useState(null);

  // Top filter
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Which member is currently being updated
  const [updatingMemberId, setUpdatingMemberId] = useState(null);

  // Error from update role API
  const [roleError, setRoleError] = useState("");

  /*
   * FILTER MEMBERS
   *
   * This dropdown only filters the list.
   *
   * It does NOT change anyone's role.
   */
  const filteredMembers =
    roleFilter === "ALL"
      ? members
      : members.filter(
          (member) =>
            member.role?.toUpperCase() === roleFilter
        );

  /*
   * UPDATE MEMBER ROLE
   *
   * This runs directly when the role dropdown
   * inside a member row is changed.
   */
  async function handleRoleChange(member, newRole) {
    // Don't allow owner role to be changed
    if (member.role === "owner") {
      return;
    }

    // If user selects the same role, do nothing
    if (member.role === newRole) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setRoleError("Authorization token is required.");
      return;
    }

    try {
      setRoleError("");
      setUpdatingMemberId(member.memberId);

      /*
       * IMPORTANT:
       *
       * Change this URL/body if your backend update-role
       * endpoint uses a different route or field names.
       */
      const response = await fetch(
        `/api/v1/workspace/${workspaceId}/members/${member.memberId}/role`,
        
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );
    console.log("Updating role for member:", member.memberId, "to", newRole);
      const data = await response.json();

      console.log("Update role response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update member role."
        );
      }

      /*
       * Refresh members after successful update.
       */
      onMemberChanged();
    } catch (error) {
      // console.error("Update member role error:", {error});

      setRoleError(error.message);
    } finally {
      setUpdatingMemberId(null);
    }
  }

  /*
   * DELETE SUCCESS
   */
  function handleDeleteSuccess() {
    setDeleteMember(null);
    onMemberChanged();
  }

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

        {/* =====================================================
            HEADER
           ===================================================== */}

        <div className="border-b border-[#e7e7e5] px-5 py-4">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-[15px] font-semibold text-[#17181a]">
                Members
              </h2>

              <p className="mt-1 text-[13px] text-[#66686d]">
                People who currently have access to this
                workspace.
              </p>
            </div>

            {/* =================================================
                TOP ROLE FILTER
               ================================================= */}

            <div className="flex items-center gap-2">

              <label
                htmlFor="member-role-filter"
                className="sr-only"
              >
                Filter members by role
              </label>

              <select
                id="member-role-filter"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="
                  rounded-[8px]
                  border
                  border-[#dededc]
                  bg-white
                  px-3
                  py-2
                  text-[12px]
                  font-medium
                  text-[#252629]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary-light)]
                "
              >
                <option value="ALL">
                  All
                </option>

                <option value="OWNER">
                  Owner
                </option>

                <option value="ADMIN">
                  Admin
                </option>

                <option value="EDITOR">
                  Editor
                </option>

                <option value="VIEWER">
                  Viewer
                </option>
              </select>

              {!loading && (
                <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {filteredMembers.length}{" "}
                  {filteredMembers.length === 1
                    ? "member"
                    : "members"}
                </span>
              )}

            </div>
          </div>
        </div>

        {/* =====================================================
            ROLE UPDATE ERROR
           ===================================================== */}

        {roleError && (
          <div className="mx-5 mt-4 rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {roleError}
          </div>
        )}

        {/* =====================================================
            LOADING
           ===================================================== */}

        {loading && (
          <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
            Loading members...
          </div>
        )}

        {/* =====================================================
            NO MEMBERS
           ===================================================== */}

        {!loading && members.length === 0 && (
          <div className="px-5 py-10 text-center">

            <p className="text-[14px] font-medium text-[#252629]">
              No members found
            </p>

            <p className="mt-1 text-[12px] text-[#7a7d84]">
              Add a member or send an invitation to get
              started.
            </p>

          </div>
        )}

        {/* =====================================================
            NO MEMBERS FOR SELECTED FILTER
           ===================================================== */}

        {!loading &&
          members.length > 0 &&
          filteredMembers.length === 0 && (
            <div className="px-5 py-10 text-center">

              <p className="text-[14px] font-medium text-[#252629]">
                No {roleFilter.toLowerCase()} members found
              </p>

              <p className="mt-1 text-[12px] text-[#7a7d84]">
                Try selecting another role.
              </p>

            </div>
          )}

        {/* =====================================================
            MEMBERS TABLE
           ===================================================== */}

        {!loading && filteredMembers.length > 0 && (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>
                <tr className="border-b border-[#e7e7e5] bg-[#fafafa]">

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Member
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredMembers.map((member) => (
                  <tr
                    key={member.memberId}
                    className="border-b border-[#eeeeec] last:border-b-0"
                  >

                    {/* =================================================
                        MEMBER
                       ================================================= */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-semibold text-[var(--color-primary-text)]">
                          {member.username
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>

                          <p className="text-[13px] font-medium text-[#252629]">
                            {member.username}
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#8a8c91]">
                            {member.user_id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* =================================================
                        ROLE DROPDOWN
                       ================================================= */}

                    <td className="px-5 py-4">

                      {member.role === "owner" ? (

                        /*
                         * Owner cannot be changed.
                         */
                        <RoleBadge role={member.role} />

                      ) : (

                        <select
                          value={member.role}
                          disabled={
                            updatingMemberId ===
                            member.memberId
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              member,
                              event.target.value
                            )
                          }
                          className="
                            rounded-[8px]
                            border
                            border-[#dededc]
                            bg-white
                            px-3
                            py-1.5
                            text-[12px]
                            font-medium
                            text-[#252629]
                            outline-none
                            focus:border-[var(--color-primary)]
                            focus:ring-2
                            focus:ring-[var(--color-primary-light)]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >

                          <option value="admin">
                            Admin
                          </option>

                          <option value="editor">
                            Editor
                          </option>

                          <option value="viewer">
                            Viewer
                          </option>

                        </select>

                      )}

                    </td>

                    {/* =================================================
                        JOINED
                       ================================================= */}

                    <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
                      {member.createAt
                        ? new Date(
                            member.createAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* =================================================
                        DELETE
                       ================================================= */}

                    <td className="px-5 py-4">

                      {member.role === "owner" ? (

                        <div className="text-right text-[12px] text-[#9a9ca1]">
                          Owner
                        </div>

                      ) : (

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteMember(member)
                            }
                            className="
                              rounded-[8px]
                              border
                              border-[var(--color-danger-border)]
                              bg-white
                              px-3
                              py-1.5
                              text-[12px]
                              font-medium
                              text-[var(--color-danger)]
                              transition
                              hover:bg-[var(--color-danger-bg)]
                            "
                          >
                            Delete
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* =========================================================
          DELETE CONFIRMATION MODAL
          
          KEEP THIS.
          You only wanted to remove the role-change modal.
         ========================================================= */}

      {deleteMember && (
        <DeleteMemberModal
          member={deleteMember}
          workspaceId={workspaceId}
          onClose={() => setDeleteMember(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}



// import { useState } from "react";
// import ChangeRoleModal from "./ChangeRoleModal";
// import DeleteMemberModal from "./DeleteMemberModal";

// function RoleBadge({ role }) {
//   const roleStyles = {
//     owner:
//       "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
//     admin:
//       "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
//     editor:
//       "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
//     viewer:
//       "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
//   };

//   return (
//     <span
//       className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
//         roleStyles[role] ||
//         "bg-[var(--color-inherited-bg)] text-[var(--color-inherited)]"
//       }`}
//     >
//       {role?.charAt(0).toUpperCase() + role?.slice(1)}
//     </span>
//   );
// }

// export default function MembersList({
//   members,
//   loading,
//   workspaceId,
//   onMemberChanged,
// }) {
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [deleteMember, setDeleteMember] = useState(null);

//   /*
//    * Store the role selected from dropdown.
//    * We don't immediately change the member's role.
//    */
//   const [pendingRoleChange, setPendingRoleChange] = useState(null);

//   /*
//    * When user selects a new role:
//    * 1. Don't update backend yet.
//    * 2. Open confirmation modal.
//    */
//   function handleRoleChange(member, newRole) {
//     if (!newRole || newRole === member.role) {
//       return;
//     }

//     setPendingRoleChange({
//       member,
//       newRole,
//     });
//   }

//   /*
//    * User cancelled role change.
//    * Nothing was changed in backend.
//    */
//   function handleRoleChangeClose() {
//     setPendingRoleChange(null);
//   }

//   /*
//    * After successful role update.
//    */
//   function handleRoleChangeSuccess() {
//     setPendingRoleChange(null);
//     onMemberChanged();
//   }

//   /*
//    * Delete modal success.
//    */
//   function handleDeleteSuccess() {
//     setDeleteMember(null);
//     onMemberChanged();
//   }

//   return (
//     <>
//       <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

//         {/* Header */}
//         <div className="border-b border-[#e7e7e5] px-5 py-4">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <h2 className="text-[15px] font-semibold text-[#17181a]">
//                 Members
//               </h2>

//               <p className="mt-1 text-[13px] text-[#66686d]">
//                 People who currently have access to this workspace.
//               </p>
//             </div>

//             {!loading && (
//               <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
//                 {members.length}{" "}
//                 {members.length === 1 ? "member" : "members"}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Loading */}
//         {loading && (
//           <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
//             Loading members...
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && members.length === 0 && (
//           <div className="px-5 py-10 text-center">
//             <p className="text-[14px] font-medium text-[#252629]">
//               No members found
//             </p>

//             <p className="mt-1 text-[12px] text-[#7a7d84]">
//               Add a member or send an invitation to get started.
//             </p>
//           </div>
//         )}

//         {/* Members table */}
//         {!loading && members.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[700px]">
//               <thead>
//                 <tr className="border-b border-[#e7e7e5] bg-[#fafafa]">

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Member
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Role
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Joined
//                   </th>

//                   <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Actions
//                   </th>

//                 </tr>
//               </thead>

//               <tbody>
//                 {members.map((member) => (
//                   <tr
//                     key={member.memberId}
//                     className="border-b border-[#eeeeec] last:border-b-0"
//                   >

//                     {/* MEMBER */}
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">

//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-semibold text-[var(--color-primary-text)]">
//                           {member.username
//                             ?.charAt(0)
//                             ?.toUpperCase() || "U"}
//                         </div>

//                         <div>
//                           <p className="text-[13px] font-medium text-[#252629]">
//                             {member.username}
//                           </p>

//                           <p className="mt-0.5 text-[11px] text-[#8a8c91]">
//                             {member.user_id}
//                           </p>
//                         </div>

//                       </div>
//                     </td>

//                     {/* ROLE */}
//                     <td className="px-5 py-4">

//                       {member.role === "owner" ? (
//                         <RoleBadge role={member.role} />
//                       ) : (
//                         <select
//                           value={member.role}
//                           onChange={(event) =>
//                             handleRoleChange(
//                               member,
//                               event.target.value
//                             )
//                           }
//                           className="
//                             rounded-[8px]
//                             border
//                             border-[var(--color-border)]
//                             bg-white
//                             px-3
//                             py-1.5
//                             text-[12px]
//                             font-medium
//                             text-[var(--color-text-secondary)]
//                             outline-none
//                             transition
//                             focus:border-[var(--color-primary)]
//                             focus:ring-2
//                             focus:ring-[var(--color-primary-light)]
//                           "
//                         >
//                           <option value="admin">
//                             Admin
//                           </option>

//                           <option value="editor">
//                             Editor
//                           </option>

//                           <option value="viewer">
//                             Viewer
//                           </option>
//                         </select>
//                       )}

//                     </td>

//                     {/* JOINED */}
//                     <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
//                       {member.createAt
//                         ? new Date(
//                             member.createAt
//                           ).toLocaleDateString()
//                         : "—"}
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="px-5 py-4">

//                       {member.role === "owner" ? (
//                         <div className="text-right text-[12px] text-[#9a9ca1]">
//                           Owner
//                         </div>
//                       ) : (
//                         <div className="flex justify-end">

//                           {/* KEEP EXISTING DELETE */}
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setDeleteMember(member)
//                             }
//                             className="
//                               rounded-[8px]
//                               border
//                               border-[var(--color-danger-border)]
//                               bg-white
//                               px-3
//                               py-1.5
//                               text-[12px]
//                               font-medium
//                               text-[var(--color-danger)]
//                               transition
//                               hover:bg-[var(--color-danger-bg)]
//                             "
//                           >
//                             Delete
//                           </button>

//                         </div>
//                       )}

//                     </td>

//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* =====================================================
//           CHANGE ROLE CONFIRMATION
//          ===================================================== */}

//       {pendingRoleChange && (
//         <ChangeRoleModal
//           member={pendingRoleChange.member}
//           newRole={pendingRoleChange.newRole}
//           workspaceId={workspaceId}
//           onClose={handleRoleChangeClose}
//           onSuccess={handleRoleChangeSuccess}
//         />
//       )}

//       {/* =====================================================
//           DELETE MEMBER CONFIRMATION
//          ===================================================== */}

//       {deleteMember && (
//         <DeleteMemberModal
//           member={deleteMember}
//           workspaceId={workspaceId}
//           onClose={() => setDeleteMember(null)}
//           onSuccess={handleDeleteSuccess}
//         />
//       )}
//     </>
//   );
// }

// ```jsx
// import { useState } from "react";
// import ChangeRoleModal from "./ChangeRoleModal";
// import DeleteMemberModal from "./DeleteMemberModal";

// function RoleBadge({ role }) {
//   const roleStyles = {
//     owner:
//       "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
//     admin:
//       "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
//     editor:
//       "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
//     viewer:
//       "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
//   };

//   return (
//     <span
//       className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
//         roleStyles[role] ||
//         "bg-[var(--color-inherited-bg)] text-[var(--color-inherited)]"
//       }`}
//     >
//       {role?.charAt(0).toUpperCase() + role?.slice(1)}
//     </span>
//   );
// }

// export default function MembersList({
//   members,
//   loading,
//   workspaceId,
//   onMemberChanged,
// }) {
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [deleteMember, setDeleteMember] = useState(null);

//   /*
//    * FILTER
//    *
//    * "ALL" means show every member.
//    *
//    * Otherwise:
//    * ADMIN  -> only admin members
//    * EDITOR -> only editor members
//    * VIEWER -> only viewer members
//    */
//   const [roleFilter, setRoleFilter] = useState("ALL");

//   /*
//    * Filter members according to selected role.
//    */
//   const filteredMembers =
//     roleFilter === "ALL"
//       ? members
//       : members.filter(
//           (member) =>
//             member.role?.toUpperCase() === roleFilter
//         );

//   /*
//    * Change role modal
//    */
//   function handleRoleSuccess() {
//     setSelectedMember(null);
//     onMemberChanged();
//   }

//   /*
//    * Delete member modal
//    */
//   function handleDeleteSuccess() {
//     setDeleteMember(null);
//     onMemberChanged();
//   }

//   return (
//     <>
//       <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

//         {/* =====================================================
//             HEADER
//            ===================================================== */}

//         <div className="border-b border-[#e7e7e5] px-5 py-4">

//           <div className="flex items-center justify-between gap-4">

//             {/* Title */}
//             <div>
//               <h2 className="text-[15px] font-semibold text-[#17181a]">
//                 Members
//               </h2>

//               <p className="mt-1 text-[13px] text-[#66686d]">
//                 People who currently have access to this
//                 workspace.
//               </p>
//             </div>

//             {/* =================================================
//                 ROLE FILTER
//                ================================================= */}

//             <div className="flex items-center gap-2">

//               <label
//                 htmlFor="member-role-filter"
//                 className="sr-only"
//               >
//                 Filter members by role
//               </label>

//               <select
//                 id="member-role-filter"
//                 value={roleFilter}
//                 onChange={(event) =>
//                   setRoleFilter(event.target.value)
//                 }
//                 className="
//                   rounded-[8px]
//                   border
//                   border-[#dededc]
//                   bg-white
//                   px-3
//                   py-2
//                   text-[12px]
//                   font-medium
//                   text-[#252629]
//                   outline-none
//                   focus:border-[var(--color-primary)]
//                   focus:ring-2
//                   focus:ring-[var(--color-primary-light)]
//                 "
//               >
//                 <option value="ALL">
//                   All
//                 </option>

//                 <option value="OWNER">
//                   Owner
//                 </option>

//                 <option value="ADMIN">
//                   Admin
//                 </option>

//                 <option value="EDITOR">
//                   Editor
//                 </option>

//                 <option value="VIEWER">
//                   Viewer
//                 </option>
//               </select>

//               {/* Count */}
//               {!loading && (
//                 <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
//                   {filteredMembers.length}{" "}
//                   {filteredMembers.length === 1
//                     ? "member"
//                     : "members"}
//                 </span>
//               )}

//             </div>
//           </div>
//         </div>

//         {/* =====================================================
//             LOADING
//            ===================================================== */}

//         {loading && (
//           <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
//             Loading members...
//           </div>
//         )}

//         {/* =====================================================
//             EMPTY - NO MEMBERS AT ALL
//            ===================================================== */}

//         {!loading && members.length === 0 && (
//           <div className="px-5 py-10 text-center">

//             <p className="text-[14px] font-medium text-[#252629]">
//               No members found
//             </p>

//             <p className="mt-1 text-[12px] text-[#7a7d84]">
//               Add a member or send an invitation to get
//               started.
//             </p>

//           </div>
//         )}

//         {/* =====================================================
//             EMPTY - FILTER RESULT
//            ===================================================== */}

//         {!loading &&
//           members.length > 0 &&
//           filteredMembers.length === 0 && (
//             <div className="px-5 py-10 text-center">

//               <p className="text-[14px] font-medium text-[#252629]">
//                 No {roleFilter.toLowerCase()} members found
//               </p>

//               <p className="mt-1 text-[12px] text-[#7a7d84]">
//                 Try selecting another role from the
//                 dropdown.
//               </p>

//             </div>
//           )}

//         {/* =====================================================
//             DESKTOP TABLE
//            ===================================================== */}

//         {!loading && filteredMembers.length > 0 && (
//           <div className="overflow-x-auto">

//             <table className="w-full min-w-[650px]">

//               {/* TABLE HEADER */}
//               <thead>
//                 <tr className="border-b border-[#e7e7e5] bg-[#fafafa]">

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Member
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Role
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Joined
//                   </th>

//                   <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Actions
//                   </th>

//                 </tr>
//               </thead>

//               {/* TABLE BODY */}
//               <tbody>

//                 {filteredMembers.map((member) => (
//                   <tr
//                     key={member.memberId}
//                     className="border-b border-[#eeeeec] last:border-b-0"
//                   >

//                     {/* =================================================
//                         MEMBER
//                        ================================================= */}

//                     <td className="px-5 py-4">

//                       <div className="flex items-center gap-3">

//                         {/* Avatar */}
//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-semibold text-[var(--color-primary-text)]">
//                           {member.username
//                             ?.charAt(0)
//                             ?.toUpperCase() || "U"}
//                         </div>

//                         {/* Name */}
//                         <div>

//                           <p className="text-[13px] font-medium text-[#252629]">
//                             {member.username}
//                           </p>

//                           <p className="mt-0.5 text-[11px] text-[#8a8c91]">
//                             {member.user_id}
//                           </p>

//                         </div>

//                       </div>

//                     </td>

//                     {/* =================================================
//                         ROLE
//                        ================================================= */}

//                     <td className="px-5 py-4">
//                       <RoleBadge role={member.role} />
//                     </td>

//                     {/* =================================================
//                         JOINED
//                        ================================================= */}

//                     <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
//                       {member.createAt
//                         ? new Date(
//                             member.createAt
//                           ).toLocaleDateString()
//                         : "—"}
//                     </td>

//                     {/* =================================================
//                         ACTIONS
//                        ================================================= */}

//                     <td className="px-5 py-4">

//                       {member.role === "owner" ? (
//                         <div className="text-right text-[12px] text-[#9a9ca1]">
//                           Owner
//                         </div>
//                       ) : (
//                         <div className="flex justify-end gap-2">

//                           {/* EDIT ROLE */}
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setSelectedMember(member)
//                             }
//                             className="
//                               rounded-[8px]
//                               border
//                               border-[var(--color-border)]
//                               bg-white
//                               px-3
//                               py-1.5
//                               text-[12px]
//                               font-medium
//                               text-[var(--color-text-secondary)]
//                               transition
//                               hover:border-[var(--color-primary)]
//                               hover:text-[var(--color-primary)]
//                             "
//                           >
//                             Edit role
//                           </button>

//                           {/* DELETE */}
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setDeleteMember(member)
//                             }
//                             className="
//                               rounded-[8px]
//                               border
//                               border-[var(--color-danger-border)]
//                               bg-white
//                               px-3
//                               py-1.5
//                               text-[12px]
//                               font-medium
//                               text-[var(--color-danger)]
//                               transition
//                               hover:bg-[var(--color-danger-bg)]
//                             "
//                           >
//                             Delete
//                           </button>

//                         </div>
//                       )}

//                     </td>

//                   </tr>
//                 ))}

//               </tbody>
//             </table>
//           </div>
//         )}

//       </div>

//       {/* =========================================================
//           EXISTING CHANGE ROLE CONFIRMATION MODAL
//          ========================================================= */}

//       {selectedMember && (
//         <ChangeRoleModal
//           member={selectedMember}
//           workspaceId={workspaceId}
//           onClose={() => setSelectedMember(null)}
//           onSuccess={handleRoleSuccess}
//         />
//       )}

//       {/* =========================================================
//           EXISTING DELETE CONFIRMATION MODAL
//          ========================================================= */}

//       {deleteMember && (
//         <DeleteMemberModal
//           member={deleteMember}
//           workspaceId={workspaceId}
//           onClose={() => setDeleteMember(null)}
//           onSuccess={handleDeleteSuccess}
//         />
//       )}
//     </>
//   );
// }




// import { useState } from "react";
// import ChangeRoleModal from "./ChangeRoleModal";
// import DeleteMemberModal from "./DeleteMemberModal";

// function RoleBadge({ role }) {
//   const roleStyles = {
//     owner: "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
//     admin: "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
//     editor: "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
//     viewer: "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
//   };

//   return (
//     <span
//       className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
//         roleStyles[role] ||
//         "bg-[var(--color-inherited-bg)] text-[var(--color-inherited)]"
//       }`}
//     >
//       {role?.charAt(0).toUpperCase() + role?.slice(1)}
//     </span>
//   );
// }

// export default function MembersList({
//   members,
//   loading,
//   workspaceId,
//   onMemberChanged,
// }) {
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [deleteMember, setDeleteMember] = useState(null);

//   return (
//     <>
//       <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
//         {/* Header */}
//         <div className="border-b border-[#e7e7e5] px-5 py-4">
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <h2 className="text-[15px] font-semibold text-[#17181a]">
//                 Members
//               </h2>

//               <p className="mt-1 text-[13px] text-[#66686d]">
//                 People who currently have access to this workspace.
//               </p>
//             </div>

//             {!loading && (
//               <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
//                 {members.length} {members.length === 1 ? "member" : "members"}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Loading */}
//         {loading && (
//           <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
//             Loading members...
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && members.length === 0 && (
//           <div className="px-5 py-10 text-center">
//             <p className="text-[14px] font-medium text-[#252629]">
//               No members found
//             </p>

//             <p className="mt-1 text-[12px] text-[#7a7d84]">
//               Add a member or send an invitation to get started.
//             </p>
//           </div>
//         )}

//         {/* Desktop table */}
//         {!loading && members.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[650px]">
//               <thead>
//                 <tr className="border-b border-[#e7e7e5] bg-[#fafafa]">
//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Member
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Role
//                   </th>

//                   <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Joined
//                   </th>

//                   <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {members.map((member) => (
//                   <tr
//                     key={member.memberId}
//                     className="border-b border-[#eeeeec] last:border-b-0"
//                   >
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-semibold text-[var(--color-primary-text)]">
//                           {member.username?.charAt(0)?.toUpperCase() || "U"}
//                         </div>

//                         <div>
//                           <p className="text-[13px] font-medium text-[#252629]">
//                             {member.username}
//                           </p>

//                           <p className="mt-0.5 text-[11px] text-[#8a8c91]">
//                             {member.user_id}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-5 py-4">
//                       <RoleBadge role={member.role} />
//                     </td>

//                     <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
//                       {member.createAt
//                         ? new Date(member.createAt).toLocaleDateString()
//                         : "—"}
//                     </td>

//                     <td className="px-5 py-4">
//                       {member.role === "owner" ? (
//                         <div className="text-right text-[12px] text-[#9a9ca1]">
//                           Owner
//                         </div>
//                       ) : (
//                         <div className="flex justify-end gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setSelectedMember(member)}
//                             className="rounded-[8px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
//                           >
//                             Edit role
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => setDeleteMember(member)}
//                             className="rounded-[8px] border border-[var(--color-danger-border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Change role */}
//       {selectedMember && (
//         <ChangeRoleModal
//           member={selectedMember}
//           workspaceId={workspaceId}
//           onClose={() => setSelectedMember(null)}
//           onSuccess={() => {
//             setSelectedMember(null);
//             onMemberChanged();
//           }}
//         />
//       )}

//       {/* Delete */}
//       {deleteMember && (
//         <DeleteMemberModal
//           member={deleteMember}
//           workspaceId={workspaceId}
//           onClose={() => setDeleteMember(null)}
//           onSuccess={() => {
//             setDeleteMember(null);
//             onMemberChanged();
//           }}
//         />
//       )}
//     </>
//   );
// }
