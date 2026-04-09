import React from 'react'
import { useState } from 'react'
import { ArrowLeft,Sparkle,TextIcon, Upload } from "lucide-react";
import { toast } from 'react-hot-toast';

const StoryModal = ({setshowmodal}) => {

const bgcolors = ["#4f46e5", "#db2777", "#e11d48","#ca8a04","#0d9488"]
const [mode, setmode] = useState("text");
const [background, setbackground] = useState(bgcolors[0])
const [text, settext] = useState("");
const [media, setmedia] = useState(null);
const [previewurl, setpreviewurl] = useState(null)
const handlemediaupload = (e)=>{
    const file = e.target.files?.[0];
    if(file){
        setmedia(file);
        setpreviewurl(URL.createObjectURL(file));
    }
}
const handlecreatestory =async ()=>{}
  return (
    <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'> 
      <div className='w-full max-w-md'>
        <div className='text-center mb-4 flex items-center justify-between'>
          <button onClick={()=>setshowmodal(false)}  className='text-white p-2  cursor-pointer'>
           <ArrowLeft />
          </button>
          <h2 className='text-lg font-semibold'>Create Story</h2> 
          <span></span>
        </div>
        <div className='rounded-lg h-96 flex items-center justify-center relative' style={{backgroundColor:background}}>
          {mode==='text' && (
            <textarea className='bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none' placeholder="What's on your mind? " onChange={(e)=>settext(e.target.value)} value={text}/> 
          )}
          {
            mode === 'media' && previewurl && (
              media?.type?.startsWith('image') ? (
                <img src={previewurl} alt="" className='object-contain max-h-full' />
              ) : (
                <video src={previewurl} className='object-contain max-h-full' />
              )
            ) 
          }
        </div>
        <div className='flex mt-4 gap-2'>
            {
              bgcolors.map((color)=>(
                <button key={color} className='w-6 h-6 rounded-full ring cursor-pointer' style={{backgroundColor:color}} onClick={()=>setbackground(color)} />
              ))
            }
        </div>
         <div className='flex gap-2 mt-4'>
          <button onClick={()=>{setmode('text');setmedia(null);setpreviewurl(null);}} className={`flex-1  flex items-center justify-center gap-2 py-2 rounded ${mode==='text' ?  'bg-white text-black':'bg-zinc-800'}`}>
            <TextIcon size={18}/> text
          </button>
          <label htmlFor="mediaUpload"  className={`flex-1  flex items-center justify-center gap-2 py-2 rounded ${mode==='media' ?  'bg-white text-black':"bg-zinc-800"}`}>
            <input id="mediaUpload" type="file" accept='image/*,video/*' onChange={(e)=>{handlemediaupload(e);setmode('media');}} className='hidden' />
             <Upload size={18} /> Photo/viedo
          </label>
         </div>
         <button onClick={()=>toast.promise(handlecreatestory, {
  loading: "Creating story...",
  success: "Story created successfully!",
  error: "Failed to create story."
})} className='flex items-center justify-center itesm-center gap-2 text-white py-4 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'>
            <Sparkle size={18} /> Create Story
          </button>
      </div>
    </div>
  )
}

export default StoryModal
