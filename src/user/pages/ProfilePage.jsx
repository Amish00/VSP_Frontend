import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save } from 'lucide-react'
import Badge from '../components/ui/Badge'
import VideoGrid from '../components/VideoGrid'
import Modal from '../components/ui/Modal'
import { useAuth } from '../../auth/context/AuthContext'
import { userApi } from '../../admin/api/userApi'
import { creatorApi } from '../../creator/api/creatorApi'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const COUNTRIES = ['Nepal', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'Japan', 'Other']

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
const sel = `${inp} appearance-none`
const readOnlyInput = "w-full bg-bg-el/50 text-text-secondary text-base rounded-xl border border-border px-4 py-3 cursor-not-allowed"

// Helper to format numbers (K, M)
const formatNumber = (num) => {
  if (num == null) return '0'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

// Helper for relative time
const formatRelativeDate = (isoDate) => {
  if (!isoDate) return 'Recently'
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now - date
  const diffSec = diffMs / 1000
  const diffMin = diffSec / 60
  const diffHour = diffMin / 60
  const diffDay = diffHour / 24

  if (diffDay >= 7) return `${Math.floor(diffDay / 7)} weeks ago`
  if (diffDay >= 1) return `${Math.floor(diffDay)} days ago`
  if (diffHour >= 1) return `${Math.floor(diffHour)} hours ago`
  if (diffMin >= 1) return `${Math.floor(diffMin)} minutes ago`
  return 'Just now'
}

// Transform backend video object to what VideoGrid expects
const transformVideo = (video) => ({
  id: video.id,
  title: video.title,
  paid: video.paid,
  views: formatNumber(video.viewCount),
  likes: formatNumber(video.likesCount),
  time: formatRelativeDate(video.publishedAt),
  thumb: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  em: video.thumbnailUrl ? '' : '🎬',
  description: video.description,
  tags: video.tags?.split(',') || [],
  category: video.category,
})

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null)
  const [pendingBannerFile, setPendingBannerFile] = useState(null)

  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    country: '',
    bio: '',
    facebook: '',
    twitter: '',
    instagram: '',
  })
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [userVideos, setUserVideos] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userData = await userApi.getCurrentUser()
        setUserId(userData.id)
        setProfile({
          fullName: userData.fullName || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dob: userData.dob || '',
          gender: userData.gender || '',
          country: userData.country || '',
          bio: userData.bio || '',
          facebook: userData.facebook || '',
          twitter: userData.twitter || '',
          instagram: userData.instagram || '',
        })
        setAvatarUrl(userData.profilePicture || '')
        setBannerUrl(userData.bannerUrl || '')

        if (userData.role !== 'ADMIN') {
          const videosRes = await creatorApi.getVideos('APPROVED')
          const rawVideos = videosRes.data.content || []
          setUserVideos(rawVideos.map(transformVideo))
        }
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const upd = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!userId) {
      alert('User ID not found. Please refresh the page.')
      return
    }
    setSaving(true)
    try {
      await userApi.updateUser(userId, profile)
      alert('Profile updated successfully')
    } catch (err) {
      console.error('Save failed', err)
      alert('Failed to save profile: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  // Avatar upload – show modal instead of window.confirm
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPendingAvatarFile(file)
    setShowAvatarModal(true)
    e.target.value = '' // allow re‑selecting same file later
  }

  const confirmAvatarUpload = async () => {
    if (!pendingAvatarFile) return
    setUploadingAvatar(true)
    setShowAvatarModal(false)
    try {
      const res = await userApi.uploadProfilePicture(pendingAvatarFile)
      setAvatarUrl(res.profilePicture)
      alert('Profile picture updated')
    } catch (err) {
      console.error('Avatar upload failed', err)
      alert('Failed to upload profile picture')
    } finally {
      setUploadingAvatar(false)
      setPendingAvatarFile(null)
    }
  }

  // Banner upload – show modal
  const handleBannerSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPendingBannerFile(file)
    setShowBannerModal(true)
    e.target.value = ''
  }

  const confirmBannerUpload = async () => {
    if (!pendingBannerFile) return
    setUploadingBanner(true)
    setShowBannerModal(false)
    try {
      const res = await userApi.uploadBanner(pendingBannerFile)
      setBannerUrl(res.bannerUrl)
      alert('Banner updated')
    } catch (err) {
      console.error('Banner upload failed', err)
      alert('Failed to upload banner')
    } finally {
      setUploadingBanner(false)
      setPendingBannerFile(null)
    }
  }

  const handleWatch = (video) => {
    navigate(`/watch/${video.id}`)
  }

  const isCreatorOrViewer = user?.role === 'CREATOR' || user?.role === 'VIEWER'
  const isAdmin = user?.role === 'ADMIN'

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-muted">Loading profile...</div>
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Banner section */}
      <div className="h-40 sm:h-52 relative overflow-hidden">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Channel banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#0A1528 0%,#0F1F40 50%,#080D18 100%)' }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%,#2563EB 0%,transparent 60%),radial-gradient(circle at 70% 50%,#0EA5E9 0%,transparent 50%)' }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />
        <input type="file" accept="image/*" onChange={handleBannerSelect} className="hidden" id="banner-upload" />
        <label htmlFor="banner-upload"
          className="absolute z-30 bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white/80 text-xs font-medium hover:bg-black/70 transition-colors cursor-pointer">
          <Camera size={12} /> {uploadingBanner ? 'Uploading...' : 'Change banner'}
        </label>
      </div>

      <div className="w-full px-4 sm:px-8">
        {/* Avatar + header */}
        <div className="relative z-10 -mt-14 sm:-mt-16 mb-6 pb-6 border-b border-border">
          <div className="inline-flex flex-col sm:flex-row items-start sm:items-end gap-4 px-4 py-3 rounded-2xl bg-bg-base/70 backdrop-blur-sm border border-border/70 shadow-[0_8px_22px_rgba(0,0,0,0.28)]">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-bg-base object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-primary border-4 border-bg-base flex items-center justify-center font-display font-black text-3xl text-white"
                  style={{ boxShadow: '0 4px 20px rgba(37,99,235,.5)' }}>
                  {(profile.fullName || profile.username).slice(0, 2).toUpperCase()}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" id="avatar-upload" />
              <label htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-bg-el border-2 border-bg-base flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <Camera size={13} />
              </label>
            </div>

            <div className="min-w-0 sm:mb-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-0.5 [text-shadow:0_2px_14px_rgba(0,0,0,0.65)]">{profile.fullName || profile.username}</h1>
              <p className="text-sm text-text-muted mb-2 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">@{profile.username}</p>
              <div className="flex flex-wrap gap-2">
                <Badge text={user?.role === 'CREATOR' ? 'Creator' : user?.role === 'VIEWER' ? '👀 Viewer' : '🛡️ Admin'} type={user?.role === 'CREATOR' ? 'pro' : 'draft'} />
                <Badge text={profile.country || 'Nepal'} type="draft" />
              </div>
            </div>
          </div>
        </div>

        {/* Form sections - full width */}
        <div className="w-full mb-10">
          <div className="bg-bg-card border border-border rounded-2xl p-6 mb-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-text-primary">Basic Information</h2>
              <button onClick={() => setShowSaveModal(true)} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-[#1d4ed8] disabled:opacity-50 transition-all">
                <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Full Name (Display Name)</label>
                <input value={profile.fullName} onChange={e => upd('fullName', e.target.value)} className={inp} placeholder="Your display name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Username</label>
                <div className={readOnlyInput}>@{profile.username}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email Address</label>
                <div className={readOnlyInput}>{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Phone Number</label>
                <input type="tel" value={profile.phone} onChange={e => upd('phone', e.target.value)} className={inp} placeholder="+977 98XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Date of Birth</label>
                <input type="date" value={profile.dob} onChange={e => upd('dob', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Gender</label>
                <select value={profile.gender} onChange={e => upd('gender', e.target.value)} className={sel}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Country</label>
                <select value={profile.country} onChange={e => upd('country', e.target.value)} className={sel}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6 mb-5">
            <h2 className="font-display font-bold text-lg text-text-primary mb-5">About & Links</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Bio</label>
              <textarea value={profile.bio} onChange={e => upd('bio', e.target.value)}
                rows={3} placeholder="Tell viewers about yourself…"
                className={`${inp} resize-none`} maxLength={300} />
              <p className="text-xs text-text-muted mt-1 text-right">{profile.bio.length}/300</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Facebook</label>
                <input value={profile.facebook} onChange={e => upd('facebook', e.target.value)} placeholder="@username" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Twitter / X</label>
                <input value={profile.twitter} onChange={e => upd('twitter', e.target.value)} placeholder="@username" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Instagram</label>
                <input value={profile.instagram} onChange={e => upd('instagram', e.target.value)} placeholder="@username" className={inp} />
              </div>
            </div>
          </div>

          {isCreatorOrViewer && (
            <>
              <h2 className="font-display font-bold text-xl text-text-primary mb-4">Your Videos</h2>
              {userVideos.length > 0 ? (
                <VideoGrid videos={userVideos} onWatch={handleWatch} />
              ) : (
                <div className="bg-bg-card border border-border rounded-2xl p-8 text-center text-text-secondary">
                  You haven't uploaded any videos yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Avatar */}
      <Modal open={showAvatarModal} onClose={() => setShowAvatarModal(false)} title="Change Profile Picture">
        <p className="text-text-secondary mb-4">Are you sure you want to replace your current profile picture with the new image?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowAvatarModal(false)} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg-el">Cancel</button>
          <button onClick={confirmAvatarUpload} className="px-3 py-1.5 rounded-lg bg-primary text-white">Confirm</button>
        </div>
      </Modal>

      {/* Confirmation Modal for Banner */}
      <Modal open={showBannerModal} onClose={() => setShowBannerModal(false)} title="Change Channel Banner">
        <p className="text-text-secondary mb-4">Are you sure you want to replace your channel banner? The new banner will be visible to everyone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowBannerModal(false)} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg-el">Cancel</button>
          <button onClick={confirmBannerUpload} className="px-3 py-1.5 rounded-lg bg-primary text-white">Confirm</button>
        </div>
      </Modal>

      {/* Confirmation Modal for Basic Info Save */}
      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)} title="Save Profile Changes">
        <p className="text-text-secondary mb-4">Are you sure you want to save the updated profile information?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowSaveModal(false)} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg-el">Cancel</button>
          <button
            onClick={async () => {
              setShowSaveModal(false)
              await handleSave()
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-white"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage