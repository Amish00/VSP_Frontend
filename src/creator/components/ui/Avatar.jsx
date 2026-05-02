import React from 'react'
const Avatar = ({channel,initials,size=32}) => {
  return(
    <div aria-hidden="true" className="rounded-full bg-primary flex items-center justify-center font-display font-bold text-white flex-shrink-0 select-none"
      style={{width:size,height:size,fontSize:(initials?size*.4:size*.42),boxShadow:'0 2px 8px rgba(37,99,235,.3)'}}>
      {initials||channel?.avatar||'👤'}
    </div>
  )
}

export default Avatar