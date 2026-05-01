import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import env from '../../config/env';

let googleScriptPromise = null;
// Track whether google.accounts.id.initialize() has already been called.
// The GSI library only supports a single initialisation per page load.
let gsiInitialised = false;

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

  // Keep latest callback refs so the GSI callback always calls the current
  // versions without needing to re-initialise the library.
  const loginWithGoogleRef = useRef(loginWithGoogle);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const roleRef = useRef(role);

  // Update refs on every render — no re-mount needed.
  loginWithGoogleRef.current = loginWithGoogle;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  roleRef.current = role;

  // Re-render the button when mode changes (signin vs signup label).
  const modeRef = useRef(mode);
  const prevMode = modeRef.current;
  modeRef.current = mode;
  const modeChanged = prevMode !== mode;

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

        // initialize() must only be called ONCE per page load across all
        // instances of this component. Subsequent mounts/re-renders skip it
        // and just re-render the button using the existing initialisation.
        if (!gsiInitialised) {
          google.accounts.id.initialize({
            client_id: env.googleClientId,
            callback: async (response) => {
              if (!response?.credential) {
                onErrorRef.current?.('Google Sign-In did not return a credential.');
                return;
              }

              setLoading(true);
              try {
                await loginWithGoogleRef.current({ credential: response.credential, role: roleRef.current });
                await onSuccessRef.current?.();
              } catch (error) {
                onErrorRef.current?.(error.message || 'Unable to continue with Google.');
              } finally {
                if (!cancelled) {
                  setLoading(false);
                }
              }
            },
          });
          gsiInitialised = true;
        }

        buttonRef.current.innerHTML = '';
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: modeRef.current === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          width: Math.max(260, Math.min(buttonRef.current.offsetWidth || 320, 360)),
        });
        setAvailable(true);
      } catch (error) {
        if (!cancelled) {
          setAvailable(false);
          onErrorRef.current?.(error.message || 'Unable to load Google Sign-In.');
        }
      }
    };

    renderButton();

    return () => {
      cancelled = true;
    };
    // Only re-run when the button label changes (signin ↔ signup).
    // All callbacks are accessed via refs so they never trigger a re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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
