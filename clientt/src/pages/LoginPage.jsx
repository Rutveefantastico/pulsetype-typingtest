import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAuthProviders } from "../api/client";

const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_BASE_URL || "http://127.0.0.1:8000";

function LoginButton({ provider, label, enabled }) {
  if (!enabled) {
    return (
      <button type="button" className="oauth-button disabled" disabled>
        {label} not configured
      </button>
    );
  }

  return (
    <a className="oauth-button" href={`${SERVER_BASE_URL}/api/auth/${provider}`}>
      Continue with {label}
    </a>
  );
}

function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const [providers, setProviders] = useState({ google: false, github: false });
  const [providersLoading, setProvidersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchAuthProviders()
      .then((data) => {
        if (mounted) {
          setProviders(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setProviders({ google: false, github: false });
        }
      })
      .finally(() => {
        if (mounted) {
          setProvidersLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-stack">
      <motion.section
        className="hero-panel auth-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-hero-content">
          <div className="auth-logo-wrap">
            <img src="/app-logo.png" alt="PulseType logo" className="auth-logo" />
          </div>
          <span className="eyebrow">Authentication</span>
          <h1>Sign in to save runs, unlock rankings, and track your progress.</h1>
          <p>
            PulseType supports Google and GitHub OAuth with JWT-backed sessions,
            protected analytics, and persistent performance history.
          </p>
        </div>
      </motion.section>

      <section className="auth-grid">
        <article className="panel auth-card">
          <span className="eyebrow">Secure sign in</span>
          <h2>Choose a provider</h2>
          <p className="auth-copy">
            Results can still be practiced anonymously, but only signed-in users
            can save scores, enter the leaderboard, and open the dashboard.
          </p>
          <div className="auth-actions">
            <LoginButton
              provider="google"
              label="Google"
              enabled={!providersLoading && providers.google}
            />
            <LoginButton
              provider="github"
              label="GitHub"
              enabled={!providersLoading && providers.github}
            />
          </div>
          {!providers.google || !providers.github ? (
            <p className="auth-hint">
              Configure missing providers in
              {" "}
              <code>server/.env</code>
              {" "}
              by setting the client ID and client secret values, then restart the backend.
            </p>
          ) : null}
        </article>

        <article className="panel auth-card secondary-card">
          <span className="eyebrow">Session status</span>
          <h2>{isAuthenticated ? `Welcome back, ${user?.name}` : "Not signed in"}</h2>
          <p className="auth-copy">
            {isAuthenticated
              ? "Your session is active and your dashboard is ready."
              : "Use one of the providers to create a persistent account."}
          </p>
        </article>
      </section>
    </div>
  );
}

export default LoginPage;
