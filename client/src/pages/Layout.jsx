import { Menu} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import Sidebar from '../components/Sidebar';
import { X } from 'lucide-react';


const Layout = () => {
  const user = dummyUserData  ; 
  const [sidebaropen, setsidebaropen] = useState(false);
  return user? (
    <div className='w-full flex h-screen '>
      <Sidebar sidebaropen={sidebaropen} setsidebaropen={setsidebaropen}/>
      <div className='flex-1  bg-slate-50  '>
          <Outlet /> 
      </div>
      {
        sidebaropen?
        <X className = 'absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm-hidden' onClick={() => setsidebaropen(false)}/>
        :
        <Menu className = 'absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm-hidden' onClick={() => setsidebaropen(true)}/> 
      }
        
    </div>
  ):
  (
     <Loading/>
  )
}

export default Layout
