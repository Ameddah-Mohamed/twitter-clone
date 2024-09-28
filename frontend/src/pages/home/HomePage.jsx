import { useState } from "react";
import CreatePost from "./CreatePost";

import Posts from "../../components/common/Posts.jsx";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <>
      <div className="min-h-screen flex-[4_4_0] border-l-[1px] border-r-[1px] border-solid rounded  border-gray-500">
        <div className="flex flex-col">
          <div className="flex justify-center items-center gap-10 w-full h-16 border-b-[1px] border-solid rounded  border-gray-500">
            <div
              className={`relative cursor-pointer ${
                feedType === "forYou" ? "font-bold" : ""
              }`}
              onClick={() => setFeedType("forYou")}
            >
              For You
              {feedType === "forYou" && (
                <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary"></span>
              )}
            </div>

            <div
              className={`relative cursor-pointer ${
                feedType === "following" ? "font-bold" : ""
              }`}
              onClick={() => setFeedType("following")}
            >
              following
              {feedType === "following" && (
                <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-primary"></span>
              )}
            </div>
          </div>

          <CreatePost />
          <Posts feedType={feedType} />
        </div>
      </div>
    </>
  );
};
export default HomePage;
