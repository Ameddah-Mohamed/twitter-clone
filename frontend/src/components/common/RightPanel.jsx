import { Link } from "react-router-dom";
import RightPanelSkeleton from "../../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/UseFollow";
import BeatLoader from "react-spinners/BeatLoader";

const RightPanel = () => {
  const { follow, isPending } = useFollow();

  const { data: fetchedSuggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users/suggested");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  return (
    <div className="hidden lg:block my-4 mx-2  top-2 right-0 h-screen sticky">
      <div className="bg-[#16181C] p-4 rounded-md ">
        <p className="font-bold pb-5">Discover New People</p>
        <div className="flex flex-col gap-4">
          {/* Show skeletons while loading */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {/* Render the suggested users once data is loaded */}
          {!isLoading &&
          fetchedSuggestedUsers &&
          Array.isArray(fetchedSuggestedUsers) &&
          fetchedSuggestedUsers.length > 0 ? (
            fetchedSuggestedUsers.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-26">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-slate-200 hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {isLoading ? (
                      <BeatLoader size="sm" color="white" />
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <>
              <div className="hidden lg:block w-64"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
