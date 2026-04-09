import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import Storiesbar from '../components/Storiesbar';
import Postcard from '../components/Postcard';
import Recentmessages from '../components/Recentmessages';

const Feed = () => {
  const [feeds, setfeeds] = useState([]);
  const [loading, setloading] = useState(true);
  const fetchfeeds = async () => {
    setfeeds(dummyPostsData);
    setloading(false);
  }
  useEffect(() => {
    fetchfeeds();
  }, [])

  return !loading ? (
    <div className=' h-full overflow-y-scroll  no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      <div>
        <Storiesbar/>
        <div className='p-4 space-y-6'>
          {feeds.map((post) => (
            <Postcard post={post} key={post._id} />
          ))}
        </div>
      </div>
      {/* right sidebar here */}
      <div className='max-xl:hidden sticky top-0'>
          <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
            <h3 className=' text-slate-800 font-semibold'>Sponsored</h3>
            <img src={assets.sponsored_img} alt="" className='w-75 h-50 rounded-md' />
            <p className='text-slate-600'>Email marketing</p>
            <p className='text-slate-600'>Supercharge your marketing with a powerful, easy-to-use platform built for your needs.</p>
          </div>
          <Recentmessages/>
      </div>
    </div>
  ) : <Loading/>
}

export default Feed
