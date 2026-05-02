import React from 'react'
import { useState } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Postcard = ({ post }) => {

  const postwithhashtags = post.content.replace(
    /#(\w+)/g,
    '<span class="text-indigo-600">#$1</span>'
  );
  const {getToken} = useAuth();

  // ✅ FIX 1: use array instead of likes_count
  const [likes, setlikes] = useState(post.likes || []);

  const navigate = useNavigate();
  const currentuser = useSelector((state) => state.user.value);

 const handlelike = async () => {
  try {
    const {data} = await api.post(
      '/api/post/like',
      {postId: post._id},
      {headers: {Authorization: `Bearer ${await getToken()}`}}
    );

    if(data.success){
      toast.success(data.message);
      setlikes(prev =>{
        if(prev.includes(currentuser._id)){
          return prev.filter(id=>id !== currentuser._id)
        }else{
          return [...prev,currentuser._id]
        }
      })
    }else{
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
}

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>

      {/* user info */}
      <div
        onClick={() => navigate('/profile/' + post.user._id)}
        className='inline-flex items-center gap-3 cursor-pointer'
      >
        <img
          src={post.user.profile_picture}
          className='w-10 h-10 rounded-full shadow'
          alt=""
        />

        <div>
          <div className='flex items-center space-x-1'>
            <span>{post.user.full_name}</span>
            <BadgeCheck className='w-4 h-4 text-blue-500' />
          </div>

          <div className='text-gray-500 text-sm'>
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* content */}
      {post.content && (
        <div
          className='text-gray-800 text-sm whitespace-pre-line'
          dangerouslySetInnerHTML={{ __html: postwithhashtags }}
        />
      )}

      {/* images */}
      <div className='grid grid-cols-2 gap-2'>
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            className={`w-full h-48 object-cover rounded-lg ${
              post.image_urls.length === 1 ? 'col-span-2 h-auto' : ''
            }`}
          />
        ))}
      </div>

      {/* actions */}
      <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-200'>

        <div className='flex items-center gap-1'>
          <Heart
            className={`w-4 h-4 cursor-pointer text-red-500 fill-current ${
              // ✅ FIX 2: safe includes check
              (likes || []).includes(currentuser?._id) ? '' : ''
            }`}
            onClick={handlelike}
          />
          <span>{likes.length}</span>
        </div>

        <div className='flex items-center gap-1'>
          <MessageCircle className='w-4 h-4' />
          <span>{12}</span>
        </div>

        <div className='flex items-center gap-1'>
          <Share className='w-4 h-4' />
          <span>{6}</span>
        </div>

      </div>
    </div>
  )
}

export default Postcard