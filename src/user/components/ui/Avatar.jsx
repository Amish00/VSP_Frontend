import React from 'react'
const Avatar = ({channel,initials,size=32}) => {
  const avatarValue = channel?.profilePicture || channel?.avatar;
  const isImage = typeof avatarValue === 'string' && /^https?:\/\//i.test(avatarValue.trim());

  return(
    <div aria-hidden="true" className="rounded-full bg-primary flex items-center justify-center font-display font-bold text-white flex-shrink-0 select-none"
      style={{width:size,height:size,fontSize:(initials?size*.4:size*.42),boxShadow:'0 2px 8px rgba(37,99,235,.3)'}}>
      {isImage ? (
        <img
          src={avatarValue.trim()}
          alt={channel?.name || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        initials || channel?.avatar || '👤'
      )}
    </div>
  )
}

export default Avatar