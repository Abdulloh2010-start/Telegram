import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import '../styles/arxiv.scss';
import { db } from '../firebase.config';
import { collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function Arxiv() {
  const { user } = useUser();
  const me = user;
  const navigate = useNavigate();
  const [archivedChats, setArchivedChats] = useState([]);
  useEffect(() => {
    if (!me || !db) return;
    const coll = collection(db, 'chats');
    const q = query(coll, where('participants', 'array-contains', me.uid), orderBy('archivedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((s) => {
        const data = { id: s.id, ...s.data() };
        if (data.archived) arr.push(data);
      });
      setArchivedChats(arr);
    }, (err) => console.error('arxiv onSnapshot', err));
    return () => unsub();
  }, [me]);

  const unarchive = async (chat) => {
    if (!chat || !db) return;
    setArchivedChats((p) => p.filter((c) => c.id !== chat.id));
    try {
      const chatDoc = doc(db, 'chats', chat.id);
      await updateDoc(chatDoc, { archived: false, archivedAt: null, archivedBy: null, lastUpdated: serverTimestamp() });
    } catch (err) {
      console.error('unarchive', err);
    }
  };

  const deleteChat = async (chatId) => {
    if (!chatId) return;
    setArchivedChats((p) => p.filter((c) => c.id !== chatId));
    try {
      const msgsColl = collection(db, `chats/${chatId}/messages`);
      const snap = await getDocs(msgsColl);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, `chats/${chatId}/messages`, d.id));
      }
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (err) {
      console.error('deleteChat arxiv', err);
    }
  };

  const openChat = (chat) => {
    setArchivedChats((p) => p.filter((c) => c.id !== chat.id));
    const evt = new CustomEvent('openChatFromArxiv', { detail: { chatId: chat.id } });
    window.dispatchEvent(evt);
    navigate('/chat', { state: { openChatId: chat.id } });
  };

  return (
    <div className="arxiv-page">
      <div className="arxiv-header">
        <h2>Архив чатов</h2>
        <div className="hint">Здесь хранятся архивированные разговоры. Можешь вернуть или удалить навсегда.</div>
      </div>
      <div className="arxiv-list">
        {archivedChats.length === 0 && <div className="empty">Архив пуст</div>}
        {archivedChats.map((c) => {
          const otherUid = (c.participants || []).find((p) => p !== me.uid);
          const meta = (c.participantsMeta || {})[otherUid] || {};
          return (
            <div key={c.id} className="arxiv-row">
              <div className="left">
                {meta.photoURL ? <img src={meta.photoURL} alt="" /> : <div className="avatar-placeholder">{(meta.displayName || meta.email || 'U').slice(0, 1)}</div>}
              </div>
              <div className="center">
                <div className="title">{meta.displayName || meta.email || 'Пользователь'}</div>
                <div className="last">{c.lastMessage || 'Нет сообщений'}</div>
              </div>
              <div className="right">
                <button className="btn-open" onClick={() => openChat(c)}>Открыть</button>
                <button className="btn-unarchive" onClick={() => unarchive(c)}>Разархивировать</button>
                <button className="btn-delete" onClick={() => deleteChat(c.id)}>Удалить</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}