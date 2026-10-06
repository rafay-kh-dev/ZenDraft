import { GoogleLogin } from '@react-oauth/google';

function App() {
  const handleLoginSuccess = (credentialResponse) => {
    console.log('✅ Mate, login was a success!', credentialResponse);
    // Soon, we will send this token to our backend to verify and log the user in!
  };

  const handleLoginError = () => {
    console.error('❌ Login Failed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>ZenDraft</h1>
        <p style={{ margin: '0 0 24px 0', color: '#666' }}>Your distraction-free writing space.</p>
        
        <GoogleLogin 
          onSuccess={handleLoginSuccess} 
          onError={handleLoginError} 
          theme="filled_blue"
          shape="rectangular"
        />
      </div>
    </div>
  );
}

export default App;