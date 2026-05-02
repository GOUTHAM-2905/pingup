import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { dummyPostsData, dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";
import { useEffect } from "react";
import UserProfileinfo from "../components/UserProfileinfo";
import Postcard from "../components/Postcard";
import { Link } from "lucide-react";
import moment from "moment";
import ProfileModel from "../components/ProfileModel";
// import { useAuth } from "../context/AuthContext";
// import api from "../../api/axios.jy
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Profile = () => {
  const currentuser = useSelector((state) => state.user.value);
  const {getToken} = useAuth()
  const { ProfileId } = useParams();
  const [user, setuser] = useState(null);
  const [posts, setposts] = useState([]);
  const [activeTab, setactiveTab] = useState([]);
  const [showEdit, setshowEdit] = useState(false);

const fetchUserData = async (profileId) => {
  const token = await getToken();

  try {
    const { data } = await api.post(
      `/api/user/profile`,
      { profileId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.success) {
      setuser(data.profile);
      setposts(data.posts);
    } else {
      toast.error(data.message);
      
    }
  } catch (error) {
    toast.error(error.message);
  }
};
useEffect(() => {
  if (ProfileId) {
    fetchUserData(ProfileId);
  } else if (currentuser?._id) {
    fetchUserData(currentuser._id);
  }
}, [ProfileId, currentuser]);

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* profilecard here */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* cover photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* profile info */}
          <UserProfileinfo
            user={user}
            posts={posts}
            profileId={ProfileId}
            setshowEdit={setshowEdit}
          />
        </div>
        {/* tabs here */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-xl p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => setactiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {/* posts here  */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col gap-6 items-center ">
              {posts.map((post) => (
                <Postcard key={post._id} post={post} user={user} />
              ))}
            </div>
          )}
          {/* media */}
            {activeTab === "media" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6 w-full">
              {posts
                .filter((post) => post.image_urls && post.image_urls.length > 0)
                .map((post) =>
                  post.image_urls.map((image, index) => (
                    <div
                      key={`${post._id}-${index}`}
                      className="relative group w-full h-40 bg-gray-200"
                    >
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                      {/* overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition"></div>

                      <p className="absolute bottom-1 right-1 text-xs px-2 py-1 text-white opacity-0 group-hover:opacity-100 transition">
                        {moment(post.createdAt).fromNow()}
                      </p>
                    </div>
                  ))
                )}
            </div>
          )}
        </div>
      </div>
      {showEdit && <ProfileModel  setshowEdit = {setshowEdit}/>}
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
