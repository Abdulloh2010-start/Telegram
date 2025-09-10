import { useUser } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import '../styles/profile.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase.config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export default function Profile() {
  const { user, logout } = useUser();
  const params = useParams();
  const navigate = useNavigate();
  const [locationInfo, setLocationInfo] = useState({ city: '', region: '' });
  const [locLoading, setLocLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [presence, setPresence] = useState(null);
  const handle = params?.handle;
  const extractUid = (h) => {
    if (!h) return null;
    if (h.includes('~')) return h.split('~').pop();
    return h;
  };
  const uid = extractUid(handle);

  useEffect(() => {
    let unsubPresence = null;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        if (uid) {
          const uRef = doc(db, 'users', uid);
          const uDoc = await getDoc(uRef);
          if (uDoc.exists()) {
            const data = uDoc.data() || {};
            if (user && user.uid === uid) {
              setProfileUser({
                uid: uDoc.id,
                displayName: user.displayName || data.displayName || '',
                email: user.email || data.email || '',
                photoURL: user.photoURL || data.photoURL || '',
                metadata: user.metadata || data.metadata || {},
                createdAt: data.createdAt || null,
                lastSignIn: data.lastSignIn || data.lastSignInTime || null,
                lastSeen: data.lastSeen || null
              });
            } else {
              setProfileUser({
                uid: uDoc.id,
                displayName: data.displayName || '',
                email: data.email || '',
                photoURL: data.photoURL || '',
                metadata: data.metadata || {},
                createdAt: data.createdAt || null,
                lastSignIn: data.lastSignIn || data.lastSignInTime || null,
                lastSeen: data.lastSeen || null
              });
            }
          } else {
            if (user && user.uid === uid) {
              setProfileUser({
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                metadata: user.metadata || {},
                createdAt: null,
                lastSignIn: null,
                lastSeen: null
              });
            } else {
              setProfileUser({ uid, displayName: 'Пользователь', email: '', createdAt: null, lastSignIn: null, lastSeen: null });
            }
          }
          const pRef = doc(db, 'presence', uid);
          const pDoc = await getDoc(pRef);
          if (pDoc.exists()) {
            setPresence(pDoc.data());
          } else {
            setPresence(null);
          }
          unsubPresence = onSnapshot(pRef, (snap) => {
            if (snap.exists()) setPresence(snap.data());
            else setPresence(null);
          }, () => {});
        } else {
          if (user) {
            const uRef = doc(db, 'users', user.uid);
            const uDoc = await getDoc(uRef);
            const data = uDoc.exists() ? uDoc.data() : {};
            setProfileUser({
              uid: user.uid,
              displayName: user.displayName || data.displayName || '',
              email: user.email || data.email || '',
              photoURL: user.photoURL || data.photoURL || '',
              metadata: user.metadata || data.metadata || {},
              createdAt: data.createdAt || null,
              lastSignIn: data.lastSignIn || data.lastSignInTime || null,
              lastSeen: data.lastSeen || null
            });
            const pRef = doc(db, 'presence', user.uid);
            const pDoc = await getDoc(pRef);
            if (pDoc.exists()) setPresence(pDoc.data());
            else setPresence(null);
            unsubPresence = onSnapshot(pRef, (snap) => {
              if (snap.exists()) setPresence(snap.data());
              else setPresence(null);
            }, () => {});
          } else {
            setProfileUser(null);
            setPresence(null);
          }
        }
      } catch (err) {
        setProfileUser(null);
        setPresence(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
    return () => {
      if (typeof unsubPresence === 'function') unsubPresence();
    };
  }, [handle, uid, user]);

  useEffect(() => {
    const cachedLocation = sessionStorage.getItem('userLocation');
    if (cachedLocation) {
      setLocationInfo(JSON.parse(cachedLocation));
      setLocLoading(false);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const address = data.address || {};
          const location = { city: address.city || address.town || address.village || 'Неизвестно', region: address.state || address.county || 'Неизвестно' };
          setLocationInfo(location);
          sessionStorage.setItem('userLocation', JSON.stringify(location));
        } catch (err) {
          setLocationInfo({ city: 'Ошибка', region: 'Ошибка' });
        } finally {
          setLocLoading(false);
        }
      }, () => { setLocationInfo({ city: '', region: '' }); setLocLoading(false); });
    } else {
      setLocationInfo({ city: 'Не поддерживается', region: '' });
      setLocLoading(false);
    }
  }, []);

  const formatTimestampToDate = (val) => {
    if (!val) return null;
    if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return null;
    }
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
    if (val.toDate) return val.toDate().toLocaleDateString();
    return null;
  };

  const formatTimestampToDateTime = (val) => {
    if (!val) return null;
    if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toLocaleString();
      return null;
    }
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleString();
    if (val.toDate) return val.toDate().toLocaleString();
    return null;
  };

  const formatLastSeen = (p) => {
    if (!p) return null;
    if (p.state === 'online') return 'Онлайн';
    if (p.lastSeen) {
      const s = formatTimestampToDateTime(p.lastSeen);
      if (s) return s;
    }
    return null;
  };

  const creationDate = () => {
    if (!profileUser) return '-';
    if (profileUser.metadata && profileUser.metadata.creationTime) return new Date(profileUser.metadata.creationTime).toLocaleDateString();
    const d = formatTimestampToDate(profileUser.createdAt || profileUser.creationTime || profileUser.created_at);
    return d || '-';
  };

  const lastSignIn = () => {
    if (!profileUser) return '-';
    const presText = formatLastSeen(presence);
    if (presText) return presText;
    if (profileUser.metadata && profileUser.metadata.lastSignInTime) return new Date(profileUser.metadata.lastSignInTime).toLocaleString();
    const pf = formatTimestampToDateTime(profileUser.lastSignIn || profileUser.lastSeen || profileUser.lastSignInTime || profileUser.last_login);
    return pf || 'Был(а): недавно';
  };

  return (
    <>
      <main className="profile">
        {loadingProfile ? (
          <div className="loader-center active">
            <div className="spinnerw"></div>
          </div>
        ) : (
          <>
            <section className="profile-header">
              <img src={profileUser?.photoURL || "/default-avatar.png"} alt="Фото профиля" className="avatar"/>
              <div>
                <h2>{profileUser?.displayName || profileUser?.email || 'Пользователь'}</h2>
                <p className="email">{profileUser?.email || ''}</p>
              </div>
            </section>

            <section className="profile-details">
              <div className="login-data"><strong>Дата регистрации:</strong> {creationDate()}</div>
              <div className="login-data"><strong>Последний вход:</strong> {lastSignIn()}</div>

            {!locLoading ? (
              <>
                <div className="detail-item"><strong>Город:</strong> {locationInfo.city || '—'}</div>
                <div className="detail-item"><strong>Район:</strong> {locationInfo.region || '—'}</div>
              </>
            ) : (
              <>
                <div className="detail-item"><strong>Город:</strong>Загрузка...</div>
                <div className="detail-item"><strong>Район:</strong>Загрузка...</div>
              </>
            )}
            </section>

            {user && user.uid === profileUser?.uid && (
              <button className="btn-logout" type="button" onClick={() => { logout(); navigate('/'); }}>Выйти</button>
            )}
          </>
        )}
      </main>
    </>
  );
};