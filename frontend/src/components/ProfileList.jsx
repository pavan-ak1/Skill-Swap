import React from 'react';
import ProfileCard from './ProfileCard';

function ProfileList({ profiles, loggedIn, userId, navigate }) {
  return (
    <div className="main-content">
      {profiles.map(profile => (
        <ProfileCard key={profile._id} profile={profile} loggedIn={loggedIn} userId={userId} navigate={navigate} />
      ))}
    </div>
  );
}

export default ProfileList; 