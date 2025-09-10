import { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase.config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function NotificationsProvider({ children }) {
  const userCtx = useUser();
  const me = userCtx?.user ?? null;
  const prevRef = useRef({});

  useEffect(() => {
    if (!me?.uid || !db) return;
    const coll = collection(db, 'chats');
    const q = query(coll, where('participants', 'array-contains', me.uid));
    const unsub = onSnapshot(q, (snap) => {
      const now = {};
      snap.forEach(docSnap => {
        const data = docSnap.data() || {};
        const id = docSnap.id;
        const lastUpdated = data.lastUpdated?.seconds || 0;
        now[id] = lastUpdated;
        const prev = prevRef.current[id] || 0;
        if (lastUpdated > prev) {
          const sender = data.lastMessageSender || null;
          if (sender && sender !== me.uid) {
            const otherUid = (data.participants || []).find(p => p !== me.uid);
            const otherMeta = (data.participantsMeta && data.participantsMeta[otherUid]) || {};
            const name = otherMeta.displayName || otherMeta.email || 'Пользователь';
            const text = data.lastMessage || 'Вложение';
            toast.info(`${name}: ${text}`, { position: 'top-right', autoClose: 4000 });
          }
        }
      });
      prevRef.current = now;
    }, (err) => {
      console.error('notifications onSnapshot error', err);
    });
    return () => unsub();
  }, [me?.uid]);

  return (
    <>
      <ToastContainer position="top-right" />
      {children}
    </>
  );
}