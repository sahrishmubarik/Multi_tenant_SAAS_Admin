import { useEffect, useState } from "react";
import MembersList from "../assets/components/MembersList.jsx";
import AddMemberCard from "../assets/components/AddMemberCard.jsx";
import InviteMemberCard from "../assets/components/InviteMemberCard.jsx";
import PendingInvitations from "../assets/components/PendingInvitations.jsx";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [pageError, setPageError] = useState("");

  const workspaceId = localStorage.getItem("workspaceId");
  const token = localStorage.getItem("token");

  const fetchMembers = async () => {
    if (!workspaceId) {
      setPageError("No workspace selected.");
      return;
    }

    try {
      setPageError("");

      const response = await fetch(
        `http://localhost:3000/api/v1/workspace/${workspaceId}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch members");
      }

      setMembers(data.member || []);
    } catch (error) {
      console.error("Fetch members error:", error);
      setPageError(error.message);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[825px]">

        {/* Header */}
        <div className="border-b border-[#e5e5e5] pb-7">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6f7177]">
            WORKSPACE
          </p>

          <h1 className="mt-2 text-[22px] font-semibold leading-tight text-[#17181a]">
            Members
          </h1>

          <p className="mt-2 max-w-[620px] text-[14px] leading-5 text-[#5f6268]">
            Manage people who have access to this workspace, their roles, and
            pending invitations.
          </p>
        </div>

        {/* Page error */}
        {pageError && (
          <div className="mt-6 rounded-[12px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-[13px] text-[var(--color-danger)]">
            {pageError}
          </div>
        )}

        {/* Add existing member */}
        <AddMemberCard
          workspaceId={workspaceId}
          onMemberAdded={fetchMembers}
        />

        {/* Invite member */}
        <InviteMemberCard
          workspaceId={workspaceId}
          onInvitationSent={fetchMembers}
        />

        {/* Members */}
        <MembersList
          members={members}
          workspaceId={workspaceId}
          onMemberChanged={fetchMembers}
        />

        {/* Pending invitations */}
        <PendingInvitations
          workspaceId={workspaceId}
        />

      </div>
    </main>
  );
}