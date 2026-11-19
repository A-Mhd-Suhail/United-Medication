import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

export default function NotificationBell({ onOpen }: { onOpen: () => void }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let stopNotifications: (() => void) | undefined;
    let cancelled = false;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopNotifications?.();
      stopNotifications = undefined;
      setUnread(0);
      if (!user) return;
      getDoc(doc(db, 'users', user.uid)).then((snap) => {
        if (cancelled) return;
        const role = snap.data()?.role;
        const targets = [user.uid, role ? `role:${role}` : ''].filter(Boolean);
        stopNotifications = onSnapshot(
          query(collection(db, 'notifications'), where('to', 'in', targets)),
          (s) => setUnread(s.docs.reduce((count, item) => count + (item.data().read ? 0 : 1), 0)),
          () => setUnread(0),
        );
      }).catch(() => setUnread(0));
    });
    return () => { cancelled = true; stopNotifications?.(); stopAuth(); };
  }, []);
  return (
    <button onClick={onOpen} title="Notifications" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-active hover:text-heading">
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-black ring-2 ring-surface">{unread > 99 ? '99+' : unread}</span>}
    </button>
  );
}
