// frontend/src/pages/Signup.tsx
// TODO: import { Auth } from ‘aws-amplify’;
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // For success or error messages

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // TODO: call Auth.signUp(…) and handle confirmation flow
      await Auth.signUp({
        username,
        password,
        attributes: { email },
      });
      setMessage('Signup successful! Check your email to confirm.');
    } catch (err: any) {
      setMessage(err.message || 'Signup failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
      {message && <p>{message}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signup;
