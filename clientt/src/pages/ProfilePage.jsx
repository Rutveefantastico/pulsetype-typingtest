import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchUserProfile, updateUserProfile } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

function ProfilePage() {
  const { refreshSession } = useAuth();
  const { themes, setTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    profile_pic_url: "",
    profile_pic_file: null,
    theme_preference: "dark",
    preferred_difficulty: "medium",
    preferred_time_limit: 60,
    typing_sound: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    const data = await fetchUserProfile();
    setProfile(data);
    setForm({
      name: data.user.name,
      profile_pic_url: data.user.profile_pic || "",
      profile_pic_file: null,
      theme_preference: data.user.theme_preference,
      preferred_difficulty: data.user.preferred_difficulty,
      preferred_time_limit: data.user.preferred_time_limit,
      typing_sound: data.user.typing_sound,
    });
    setIsLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");

    try {
      const response = await updateUserProfile(form);
      setProfile(response);
      setTheme(form.theme_preference);
      await refreshSession();
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !profile) {
    return <div className="panel table-state">Loading profile...</div>;
  }

  return (
    <div className="page-stack">
      <motion.section
        className="hero-panel compact"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="profile-summary">
          {profile.user.profile_pic ? (
            <img className="profile-avatar large" src={profile.user.profile_pic} alt={profile.user.name} />
          ) : (
            <div className="profile-avatar large fallback-avatar">
              {profile.user.name.slice(0, 1)}
            </div>
          )}
          <div>
            <span className="eyebrow">Profile</span>
            <h1>{profile.user.name}</h1>
            <p>{profile.user.email}</p>
            <p>Joined {new Date(profile.joined_date).toLocaleDateString()}</p>
          </div>
        </div>
      </motion.section>

      <form className="panel profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label>
            Profile picture URL
            <input
              value={form.profile_pic_url}
              onChange={(event) => setForm({ ...form, profile_pic_url: event.target.value })}
            />
          </label>
          <label>
            Upload profile picture
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setForm({ ...form, profile_pic_file: event.target.files?.[0] || null })
              }
            />
          </label>
          <label>
            Theme
            <select
              value={form.theme_preference}
              onChange={(event) => setForm({ ...form, theme_preference: event.target.value })}
            >
              {themes.map((themeOption) => (
                <option key={themeOption} value={themeOption}>
                  {themeOption}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preferred difficulty
            <select
              value={form.preferred_difficulty}
              onChange={(event) => setForm({ ...form, preferred_difficulty: event.target.value })}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>
          <label>
            Preferred timer
            <input
              type="number"
              min="15"
              max="1000"
              value={form.preferred_time_limit}
              onChange={(event) =>
                setForm({ ...form, preferred_time_limit: Number(event.target.value) })
              }
            />
          </label>
        </div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={form.typing_sound}
            onChange={(event) => setForm({ ...form, typing_sound: event.target.checked })}
          />
          Enable typing sound
        </label>
        {status ? <p className="auth-hint">{status}</p> : null}
        <button className="button primary" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
