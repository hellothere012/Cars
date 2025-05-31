// frontend/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify'; // For user attributes, change password

// TODO: Define interface for user profile data if more complex than attributes
interface UserProfile {
  username?: string;
  email?: string;
  // Add other custom attributes if any
}

function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch user attributes using Auth.currentUserInfo() or Auth.currentAuthenticatedUser()
    // setIsLoading(true);
    // Auth.currentAuthenticatedUser({ bypassCache: true })
    //   .then(cognitoUser => {
    //     setUserProfile({
    //       username: cognitoUser.username,
    //       email: cognitoUser.attributes.email,
    //     });
    //   })
    //   .catch(err => setError('Failed to load user profile.'))
    //   .finally(() => setIsLoading(false));
    console.log('TODO: Fetch user profile data');
  }, []);

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    // TODO: Implement password change logic using Auth.currentAuthenticatedUser() and Auth.changePassword()
    // setMessage(null); setError(null);
    // try {
    //   const cognitoUser = await Auth.currentAuthenticatedUser();
    //   await Auth.changePassword(cognitoUser, oldPassword, newPassword);
    //   setMessage('Password changed successfully.');
    // } catch (err: any) {
    //   setError(err.message || 'Failed to change password.');
    // }
    console.log('TODO: Implement change password', oldPassword, newPassword); // Added params to log
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p> {/* TODO: Display user information (e.g., username, email). */} </p>
      <p> {/* TODO: Implement functionality to change password. */} </p>
      <p> {/* TODO: Implement functionality to update other user attributes if applicable. */} </p>
      {userProfile && (
        <div>
          <p><strong>Username:</strong> {userProfile.username}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
        </div>
      )}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {/* TODO: Add form for changing password e.g.
      <form onSubmit={e => {
        e.preventDefault();
        const oldPass = (e.target as any).oldPassword.value;
        const newPass = (e.target as any).newPassword.value;
        handleChangePassword(oldPass, newPass);
      }}>
        <input name="oldPassword" type="password" placeholder="Old Password" />
        <input name="newPassword" type="password" placeholder="New Password" />
        <button type="submit">Change Password</button>
      </form>
      */}
    </div>
  );
}

export default Profile;
