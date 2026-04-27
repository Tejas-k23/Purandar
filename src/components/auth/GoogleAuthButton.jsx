import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import env from '../../config/env';

let googleScriptPromise;

const loadGoogleScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In is only available in the browser.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-identity="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google));
        existing.addEventListener('error', () => reject(new Error('Unable to load Google Sign-In.')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Unable to load Google Sign-In.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

export default function GoogleAuthButton({
  mode = 'signin',
  role = 'user',
  disabled = false,
  onSuccess,
  onError,
}) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(Boolean(env.googleClientId));

  useEffect(() => {
    let cancelled = false;

    const renderButton = async () => {
      if (!env.googleClientId || !buttonRef.current) {
        setAvailable(false);
        return;
      }

      try {
        const google = await loadGoogleScript();
        if (cancelled || !buttonRef.current || !google?.accounts?.id) return;

        buttonRef.current.innerHTML = '';
        google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: async (response) => {
            if (!response?.credential) {
              onError?.('Google Sign-In did not return a credential.');
              return;
            }

            setLoading(true);
            try {
              await loginWithGoogle({ credential: response.credential, role });
              await onSuccess?.();
            } catch (error) {
              onError?.(error.message || 'Unable to continue with Google.');
            } finally {
              if (!cancelled) {
                setLoading(false);
              }
            }
          },
        });

        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          width: Math.max(260, Math.min(buttonRef.current.offsetWidth || 320, 360)),
        });
        setAvailable(true);
      } catch (error) {
        if (!cancelled) {
          setAvailable(false);
          onError?.(error.message || 'Unable to load Google Sign-In.');
        }
      }
    };

    renderButton();

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, mode, onError, onSuccess, role]);

  if (!available) {
    return null;
  }

  return (
    <div className={`auth-google-wrap ${disabled ? 'is-disabled' : ''}`}>
      <div ref={buttonRef} className="auth-google-button" aria-hidden={loading || disabled} />
      {loading || disabled ? (
        <div className="auth-google-overlay">
          <span>{loading ? 'Please wait...' : 'Unavailable'}</span>
        </div>
      ) : null}
    </div>
  );
}
