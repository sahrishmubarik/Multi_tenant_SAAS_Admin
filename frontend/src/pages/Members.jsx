import { useEffect, useState } from "react";
import { api } from "@/services/api";
import MembersList from "@/components/MembersList.jsx";
import InviteMemberCard from "@/components/InviteMemberCard.jsx";
import PendingInvitations from "@/components/PendingInvitations.jsx";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [pageError, setPageError] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState("");
  // Used to tell PendingInvitations that a new invitation was created
  const [invitationRefresh, setInvitationRefresh] = useState(0);

  const workspaceId = localStorage.getItem("workspaceId");
  const token = localStorage.getItem("token");

  // =========================
  // INVITATION SENT
  // =========================

  function handleInvitationSent() {
    setInvitationRefresh((previous) => previous + 1);
  }

  // =========================
  // FETCH MEMBERS
  // =========================

  async function fetchMembers(role = "all") {
    setPageError("");

    if (!token || !workspaceId) {
      return;
    }

    try {
      setLoadingMembers(true);

      let url = `/workspace/${workspaceId}/members`;

      if (role !== "all") {
        url = `/workspace/${workspaceId}/members/role/${role}`;
      }

      const data = await api.get(url);

      setMembers(data.members || data.member || []);
    } catch (error) {
      console.error("Fetch members error:", error);

      setPageError(error.message);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }
  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  }
  // =========================
  // ROLE FILTER
  // =========================

  function handleRoleFilterChange(role) {
    setRoleFilter(role);
    fetchMembers(role);
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
      {/* TOAST */}
      {toast && (
        <div
          className="
            fixed
            right-6
            top-6
            z-50
            rounded-lg
            border
            border-[var(--color-success-border)]
            bg-[var(--color-success-bg)]
            px-5
            py-3
            text-sm
            font-medium
            text-[var(--color-success)]
            shadow-lg
          "
        >
          {toast}
        </div>
      )}

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

        {/* =========================
            INVITE MEMBER
            ========================= */}

        <InviteMemberCard
          workspaceId={workspaceId}
          onInvitationSent={handleInvitationSent}
          onShowToast={showToast}
        />

        {/* =========================
            MEMBERS
            ========================= */}

        <MembersList
          members={members}
          loading={loadingMembers}
          workspaceId={workspaceId}
          roleFilter={roleFilter}
          onShowToast={showToast}
          onRoleFilterChange={handleRoleFilterChange}
          onMemberChanged={() => fetchMembers(roleFilter)}
        />

        {/* =========================
            PENDING INVITATIONS
            ========================= */}

        <PendingInvitations
          workspaceId={workspaceId}
          invitationRefresh={invitationRefresh}
          onShowToast={showToast}
        />
      </div>
    </main>
  );
}
