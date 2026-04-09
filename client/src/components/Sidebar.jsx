import React from 'react'
import { assets, dummyUserData } from '../assets/assets'
import Menuitems from './Menuitems'
import {CirclePlus} from 'lucide-react';
import { useNavigate,Link } from 'react-router-dom'
import { UserButton, useClerk } from '@clerk/clerk-react';
import { LogOut } from 'lucide-react';

const Sidebar = ({ sidebaropen, setsidebaropen }) => {

  const navigate = useNavigate()
  const user = dummyUserData
  const {signOut} = useClerk();

  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-grey-800 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-10 z-20 ${sidebaropen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>

      <div className='w-full'>
        <img 
          onClick={() => navigate('/')} 
          src={assets.logo} 
          alt="" 
          className='ml-7 my-2 cursor-pointer'
        />

        <hr className='border-gray-300 mb-8'/>
        <Menuitems setsidebaropen={setsidebaropen}/>
        <Link className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer' to='/create-post'>
          <CirclePlus className='w-5 h-5'/>
          Create Post
        </Link>
        
      </div>
      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div className='flex gap-2 items-center cursor-pointer'>
          <UserButton />
          <div>
            <h1 className='text-sm font-medium'> {user.full_name}</h1>
            <p className='text-xs text-gray-500'>@{user.username}</p>
          </div>
        </div>
        <LogOut onClick={() => signOut()} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer' />

      </div>

    </div>
  )
}

export default Sidebar