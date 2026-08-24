import { useEffect, useState } from "react";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const workspaceId =localStorage.getItem("workspaceId"); 
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

      const response = await fetch(
        `http://localhost:3000/api/v1/workspace/activity/${workspaceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch activities"
        );
      }

      setActivities(data.activities || []);
    } catch (error) {
      console.error("Activity error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [workspaceId]);

  return (
     <main className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[825px]">

    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      
      {/* Header */}
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Activity
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Recent activity and actions in this workspace.
        </p>
      </div>

      {/* Content */}
      <div className="px-5 py-5">

        {/* Loading */}
        {loading && (
          <p className="text-[13px] text-[#77797e]">
            Loading activity...
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          activities.length === 0 && (
            <p className="text-[13px] text-[#77797e]">
              No activity yet.
            </p>
          )}

        {/* Activities */}
        {!loading &&
          !error &&
          activities.length > 0 && (
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
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
      </div>
    </main>
  );
}