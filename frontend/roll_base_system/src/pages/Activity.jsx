import { useEffect, useState } from "react";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. DYNAMIC PAGINATION AND RECORD LIMIT STATES
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(10); // Managed as a state variable now

  const workspaceId = localStorage.getItem("workspaceId");

  const fetchActivities = async () => {
    if (!workspaceId) {
      setError("No workspace selected.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authToken = localStorage.getItem("token");

      if (!authToken) {
        setError("Authorization token is required.");
        setLoading(false);
        return;
      }

      // 2. DEPENDS DIRECTLY ON DYNAMIC LIMIT STATE VALUE
      const response = await fetch(
        `/api/v1/workspace/activity/${workspaceId}?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to fetch activities");
      }

      const activityData = resData.data || resData.activities || [];
      setActivities(activityData);

      if (resData.meta) {
        setHasMore(resData.meta.count === Number(limit));
      } else {
        setHasMore(activityData.length === Number(limit));
      }
    } catch (error) {
      console.log("Activity error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. TRIGGER UPDATE: Fires when page OR the dynamic limit selector drops/switches
  useEffect(() => {
    fetchActivities();
  }, [workspaceId, page, limit]);

  // Helper function to update items per page and return to page 1
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Jump back to the start so you don't break data boundary offsets
  };

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[825px]">
        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
          {/* Header Top Bar with Row Limit Selector Selector Box */}
          <div className="border-b border-[#e7e7e5] px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#17181a]">
                Activity
              </h2>
              <p className="mt-1 text-[13px] text-[#66686d]">
                Recent activity and actions in this workspace.
              </p>
            </div>

            {/* Dynamic Records Limit Selector Box */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="limit"
                className="text-[12px] font-medium text-[#66686d]"
              >
                Show:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={handleLimitChange}
                className="cursor-pointer rounded-[8px] border border-[#dededc] bg-white px-2 py-1 text-[13px] font-medium text-[#17181a] shadow-sm focus:border-[#66686d] focus:outline-none hover:cursor-pointer"
              >
                <option value={5}>5 records</option>
                <option value={10}>10 records</option>
                <option value={20}>20 records</option>
                <option value={50}>50 records</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5">
            {/* Loading */}
            {loading && (
              <p className="text-[13px] text-[#77797e]">Loading activity...</p>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && activities.length === 0 && (
              <p className="text-[13px] text-[#77797e]">No activity yet.</p>
            )}

            {/* Activities */}
            {!loading && !error && activities.length > 0 && (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-[10px] border border-[#e5e5e2] px-4 py-3"
                  >
                    <p className="text-[13px] font-medium text-[#252629]">
                      {activity.message}
                    </p>

                    <p className="mt-1 text-[12px] text-[#77797e]">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!error && activities.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-[#e7e7e5] pt-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1 || loading}
                  className="btn-page "
                  // className="rounded-[8px] border border-[#dededc] px-4 py-2 text-[13px] font-medium text-[#17181a] bg-white transition hover:bg-[#f4f7f4] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-[13px] text-[#66686d] font-medium">
                  Page {page}
                </span>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!hasMore || loading}
                  className="btn-page"
                  // className="rounded-[8px] border border-[#dededc] px-4 py-2 text-[13px] font-medium text-[#17181a] bg-white transition hover:bg-[#f4f7f4] disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:border-[var(--color-primary-hover)]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// import { useEffect, useState } from "react";

// export default function Activity() {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
// const workspaceId =localStorage.getItem("workspaceId");
//   const fetchActivities = async () => {
//     if (!workspaceId) {
//       setError("No workspace selected.");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const authToken = localStorage.getItem("token");

//       if (!authToken) {
//         setError("Authorization token is required.");
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(
//         `/api/v1/workspace/activity/${workspaceId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to fetch activities"
//         );
//       }

//       setActivities(data.activities || []);
//     } catch (error) {
//       console.log("Activity error:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchActivities();
//   }, [workspaceId]);

//   return (
//      <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
//       <div className="mx-auto w-full max-w-[825px]">

//     <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

//       {/* Header */}
//       <div className="border-b border-[#e7e7e5] px-5 py-4">
//         <h2 className="text-[15px] font-semibold text-[#17181a]">
//           Activity
//         </h2>

//         <p className="mt-1 text-[13px] text-[#66686d]">
//           Recent activity and actions in this workspace.
//         </p>
//       </div>

//       {/* Content */}
//       <div className="px-5 py-5">

//         {/* Loading */}
//         {loading && (
//           <p className="text-[13px] text-[#77797e]">
//             Loading activity...
//           </p>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
//             {error}
//           </div>
//         )}

//         {/* Empty */}
//         {!loading &&
//           !error &&
//           activities.length === 0 && (
//             <p className="text-[13px] text-[#77797e]">
//               No activity yet.
//             </p>
//           )}

//         {/* Activities */}
//         {!loading &&
//           !error &&
//           activities.length > 0 && (
//             <div className="space-y-3">
//               {activities.map((activity) => (
//                 <div
//                   key={activity.id}
//                   className="rounded-[10px] border border-[#e5e5e2] px-4 py-3"
//                 >
//                   <p className="text-[13px] font-medium text-[#252629]">
//                     {activity.message}
//                   </p>

//                   <p className="mt-1 text-[12px] text-[#77797e]">
//                     {new Date(
//                       activity.createdAt
//                     ).toLocaleString()}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//       </div>
//     </div>
//       </div>
//     </main>
//   );
// }
