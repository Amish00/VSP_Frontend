import React,{useState} from 'react'
import UserTable from '../components/UserTable'
const UsersPage = () => {
  const [search,setSearch]=useState('')
  return(
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">User Management</h1>
      </div>
      <UserTable/>
    </div>
  )
}

export default UsersPage
