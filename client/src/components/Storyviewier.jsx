import React from 'react'
import { BadgeCheck ,X} from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'

const Storyviewier = ({viewstory,setviewstory}) => {
    const [progress, setprogress] = useState(0)
    useEffect(() => {
      let timer,progressInterval;
      if(viewstory&&viewstory.media_type!=='video'){
       setprogress(0);
       const duration =10000;
       const setTime =100;
       let elapsed=0;
         progressInterval = setInterval(() => {
            elapsed += setTime;
            setprogress((elapsed / duration) * 100);
         },setTime);

         timer = setTimeout(() => {
            setviewstory(null);
         }, duration); 
      }
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      }
    }, [viewstory,setviewstory])
    
    const handleclose = ()=>{
        setviewstory(null)
    }
const rendercontent = () => {
  if (!viewstory) return null;

  switch (viewstory.media_type) {
    case 'image':
      return (
        <img
          src={viewstory.media_url}
          alt=""
          className="max-w-full max-h-screen object-contain"
        />
      );

    case 'video':
      return (
        <video
          onEnded={() => setviewstory(null)}
          src={viewstory.media_url}
          className="max-h-screen"
          controls
          autoPlay
        />
      );

    case 'text':
      return (
        <div      className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
          {viewstory.content}
        </div>
      );

    default:
      return null;
  }
};
  return (
    <div className='fixed inset-0 h-screen  bg-black  bg-opacity-90 z-110 flex items-center  justiy-center' style={{backgroundColor:viewstory.media_type==='text' ? viewstory.background_color:'#000000'}}>
        <div className='absolute top-0 left-0 w-full h-1 bg-gray-700 animate-progress'>
            <div className='h-full bg-white transition-all duration-100 linear' style={{width:`${progress}%`}}>
            </div>
        </div>
        <div className=' absolute top-4 left-4 flex items-center p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50 gap-3 '>
            <img src={viewstory.user?.profile_picture} alt=""  className='size-7 sm:size-8 rounded-full object-cover border border-white'/>
            <div className='text-white font-medium flex items-center gap-1.5'>
                <span>{viewstory.user?.full_name}</span>
                <BadgeCheck size={15}/>
            </div>

        </div>
        <button onClick={handleclose} className='absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none'>
                <X className='top-4 right-4 w-8 h-8 hover:scale-110 transition cursor-pointer'/>
        </button>
       <div className='w-full h-full flex items-center justify-center'>
           {rendercontent()}
        </div>
    </div>
  )
}

export default Storyviewier
