import React, { useState } from 'react';

interface UserAvatarProps {
  profilePictureUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  profilePictureUrl, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl'
  };

  const initial = name?.charAt(0).toUpperCase() || '?';
  
  // Generate a consistent color based on the name
  const getColorFromName = (name: string | null | undefined) => {
    if (!name) return 'from-gray-400 to-gray-600';
    
    const colors = [
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
      'from-red-500 to-red-700',
      'from-yellow-500 to-yellow-700',
      'from-teal-500 to-teal-700'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (profilePictureUrl && !imageError) {
    return (
      <img 
        src={profilePictureUrl} 
        alt={name || 'Profile'} 
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => {
          setImageError(true);
        }}
      />
    );
  }

  // Default avatar with initial
  return (
    <div 
      className={`${sizeClasses[size]} bg-gradient-to-br ${getColorFromName(name)} rounded-full flex items-center justify-center ${className}`}
    >
      <span className="text-white font-semibold">{initial}</span>
    </div>
  );
};

export default UserAvatar;