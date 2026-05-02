import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useSelector ,useDispatch} from 'react-redux';   
import { useAuth } from '@clerk/clerk-react';
import moment from 'moment';
import { updateUser } from '../features/user/userSlice';
import toast from 'react-hot-toast';


const ProfileModel = ({setshowEdit}) => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const {getToken} = useAuth();

  const [editForm, seteditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handlesaveprofile = async (e) => {
     try { 
      const userData = new FormData();
      const {username, bio, location, full_name,profile_picture,cover_photo} = editForm;
      userData.append("username",username);
      userData.append("bio", bio);
      userData.append("location", location);
      userData.append("full_name", full_name);
      profile_picture && userData.append("profile", profile_picture);
      cover_photo && userData.append("cover", cover_photo);
       
      setshowEdit(false);
      const token = await getToken();

      dispatch(updateUser({userData,token}))
     } catch (error) {
      toast.error(error.message);
     }
  };

  return (
    <div className='fixed inset-0 z-110 overflow-y-auto bg-black/50'>
      <div className='max-w-2xl sm:py-6 mx-auto pb-10'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>

          <form className='space-y-4' onSubmit={e=> toast.promise(handlesaveprofile(e),{
            loading: "Saving changes...",
          })}>
            
            {/* Profile Picture */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor="profile_picture" className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Picture
              
                <input hidden
                  type="file" 
                  accept='image/*' 
                  id='profile_picture'
                  onChange={(e) => seteditForm({
                    ...editForm,
                    profile_picture: e.target.files[0]
                  })} 
                />

                <div className='relative group w-24 h-24 mt-2'>
                  <img 
                    src={
                      editForm.profile_picture
                        ? URL.createObjectURL(editForm.profile_picture)
                        : user.profile_picture
                    }
                    className='w-full h-full rounded-full object-cover'
                    alt="Profile"
                  />

                  <div className='absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
                    <Pencil className='w-5 h-5 text-white' />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover Photo */}
            <div className='flex flex-col items-start gap-3'>
              <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700 mb-1'>
                Cover photo

                <input hidden
                  type="file" 
                  accept='image/*' 
                  id='cover_photo'
                  onChange={(e) => seteditForm({
                    ...editForm,
                    cover_photo: e.target.files[0]
                  })} 
                />

                <div className='relative group mt-2'>
                  <img 
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user.cover_photo
                    }
                    className='w-80 h-40 rounded-lg object-cover'
                    alt="Cover"
                  />

                  <div className='absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
                    <Pencil className='w-5 h-5 text-white' />
                  </div>
                </div>
              </label>
            </div>

            {/* Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
              <input 
                type="text"
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='please enter your full name'
                value={editForm.full_name}
                onChange={(e)=>seteditForm({...editForm,full_name:e.target.value})}
              />
            </div>

            {/* Username */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
              <input 
                type="text"
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='please enter a username'
                value={editForm.username}
                onChange={(e)=>seteditForm({...editForm,username:e.target.value})}
              />
            </div>

            {/* Bio */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
              <textarea 
                rows={3}
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='please enter a short bio'
                value={editForm.bio}
                onChange={(e)=>seteditForm({...editForm,bio:e.target.value})}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
               <input 
                type="text"
                className='w-full p-3 border border-gray-200 rounded-lg'
                placeholder='please enter your location'
                value={editForm.location}
                onChange={(e)=>seteditForm({...editForm,location:e.target.value})}
              />
            </div>
            <div className='flex justify-end space-x-3 pt-6'>
                    <button type = 'button' className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors' onClick={() => setshowEdit(false)}>Cancel</button>
                    <button  type = 'submit ' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModel;