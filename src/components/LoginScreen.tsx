import { useState } from 'react';
import { Truck, Lock, ArrowRight, Building2, User, Mail } from 'lucide-react';
import './LoginScreen.css';

export interface Company {
  id: string;
  name: string;
  type: string;
  token?: string; 
  user?: { name: string; email: string; };
}

interface LoginScreenProps {
  onLogin: (company: Company) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('admin@vrl.com');
  const [password, setPassword] = useState('demo');
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const endpoint = isSignup 
      ? `${import.meta.env.VITE_API_URL}/api/auth/signup` 
      : `${import.meta.env.VITE_API_URL}/api/auth/login`;
    const payload = isSignup 
      ? { email, password, userName, companyName }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        onLogin({
          ...data.company,
          token: data.token,
          user: data.user
        });
      } else {
        setError(data.message || 'Authentication Failed');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to FleetIQ Server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    if (!isSignup) {
      setEmail('');
      setPassword('');
    } else {
      setEmail('admin@vrl.com');
      setPassword('demo');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel" style={{ maxWidth: isSignup ? '480px' : '420px' }}>
        
        <div className="login-header">
          <div className="logo-icon large">
            <Truck size={32} color="var(--accent-blue)" />
          </div>
          <h1>FleetIQ <span className="ai-badge">AI</span></h1>
          <p className="login-subtitle">
            {isSignup ? 'Register New Tenant Workspace' : 'Predictive Operations Engine'}
          </p>
        </div>

        {error && <div className="secure-badge" style={{color: 'var(--accent-red)', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" required
                    value={userName} onChange={e => setUserName(e.target.value)}
                    className="password-input active-input" placeholder="e.g. Rahul Sharma"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company/Fleet Name</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input 
                    type="text" required
                    value={companyName} onChange={e => setCompanyName(e.target.value)}
                    className="password-input active-input" placeholder="e.g. Delhivery Logistics"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Work Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="password-input active-input" placeholder="admin@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Access Vault Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="password-input active-input" placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : (isSignup ? 'Create Workspace' : 'Secure Access')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div className="login-footer">
          <button type="button" onClick={toggleMode} className="view-all-btn" style={{fontSize: '0.85rem'}}>
            {isSignup ? "Already have an account? Sign In" : "Don't have an account? Request Access"}
          </button>
          <p style={{marginTop: '1rem'}}>End-to-End Encrypted Live Workspace</p>
        </div>

      </div>
    </div>
  );
}
