import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import "../i18n";

interface LoginPageProps {
  onLogin?: (user: { id: number; firstName: string; role: string }) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage: React.FC<LoginPageProps> = ({ role, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(role || '');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
//  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Learner' | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  // Re-render quand la langue change
  useEffect(() => {}, [i18n.language]);

  // --- HANDLE SIGNUP ---
  const handleSignup = async () => {
    if (!selectedRole || !email || !password) {
      alert(t('auth.fill_required_fields') || "Please fill all required fields");
      return;
    }

    try {
      const payload = {
        role: selectedRole,
        firstName,
        lastName,
        email,
        password,
        description,
        video: video ? video.name : null,
      };

      console.log("👉 Données envoyées :", payload);

      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📦 Réponse backend :", data);

      if (response.ok) {
        alert(t('auth.signup_success') || "✅ Account created successfully!");
        // Reset champs
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setDescription('');
        setVideo(null);
        setIsSignup(false);
      } else {
        alert(`❌ ${data.error || t('auth.signup_failed') || "Signup failed"}`);
      }
    } catch (err) {
      console.error("💥 Erreur frontend :", err);
      alert(t('auth.network_error') || "Network error: unable to reach server");
    }
  };

  // --- HANDLE LOGIN ---
const handleLogin = async () => {
  if (!selectedRole  || !email || !password) {
    setError(t('auth.fill_all_fields') || 'Please fill all fields');
    return;
  }

  try {
    setLoading(true);
    setError('');

    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || t('auth.login_failed') || 'Login failed');
      setLoading(false);
      return;
    }

    // Stocker l'utilisateur et remonter vers App.tsx
    localStorage.setItem('user', JSON.stringify(data.user));
    if (onLogin) onLogin(data.user);  // met à jour currentUser dans App.tsx

    // ⚡ Ajout de la redirection automatique vers Home
    if (typeof window !== 'undefined') {
      window.location.href = '/'; // ou tu peux utiliser setCurrentPage('Home') depuis App.tsx si tu passes la fonction
    }

    alert(`${t('auth.welcome') || "Welcome"} ${data.user.firstName}!`);
    setLoading(false);
  } catch (err) {
    console.error(err);
    setError(t('auth.server_error') || 'Server error');
    setLoading(false);
  }
};


  return (
    <div className="py-12 px-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignup ? t('auth.signup') : t('auth.login_signup')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role selection */}
            <div>
               <label>{t('auth.select_role')}</label>
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger>
          <SelectValue placeholder={t('auth.select_role')} />
        </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t('auth.admin')}</SelectItem>
                  <SelectItem value="Teacher">{t('auth.teacher')}</SelectItem>
                  <SelectItem value="Learner">{t('auth.learner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2">{t('auth.email')}</label>
              <Input
                type="email"
                placeholder={t('auth.enter_email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2">{t('auth.password')}</label>
              <Input
                type="password"
                placeholder={t('auth.enter_password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Signup fields */}
            {isSignup && selectedRole && (
              <>
                <div>
                  <label className="block mb-2">{t('auth.first_name')}</label>
                  <Input
                    type="text"
                    placeholder={t('auth.enter_first_name')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2">{t('auth.last_name')}</label>
                  <Input
                    type="text"
                    placeholder={t('auth.enter_last_name')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                {(selectedRole === 'Teacher' || selectedRole === 'Learner') && (
                  <div>
                    <label className="block mb-2">{t('auth.description')}</label>
                    <Textarea
                      placeholder={t('auth.enter_description')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                )}

                {selectedRole === 'Teacher' && (
                  <div>
                    <label className="block mb-2">{t('auth.video')}</label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </>
            )}

            {/* Error message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={isSignup ? handleSignup : handleLogin}
                disabled={loading}
              >
                {loading
                  ? t('auth.loading')
                  : isSignup
                  ? t('auth.signup')
                  : t('auth.login')}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSignup((prev) => !prev)}
              >
                {isSignup ? t('auth.back_to_login') : t('auth.create_account')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
