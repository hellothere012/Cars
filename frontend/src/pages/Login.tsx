// frontend/src/pages/Login.tsx
// TODO: import { Auth } from ‘aws-amplify’;
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';

// TODO: handle form state and validation
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // TODO: call Auth.signIn(…) and handle tokens
      await Auth.signIn(username, password);
      router.push('/vehicles');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}

export default Login;
