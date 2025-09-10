import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (
          parsed?.uid &&
          parsed?.email &&
          parsed?.metadata?.creationTime &&
          parsed?.metadata?.lastSignInTime
        ) {
          setUserState(parsed);
        } else {
          Cookies.remove("user");
        }
      } catch (e) {
        console.error("❌ Ошибка при парсинге куки user:", e);
        Cookies.remove("user");
      }
    }
    setLoading(false);
  }, []);

  const setUser = (userData) => {
    const safeUser = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      metadata: {
        creationTime: userData.metadata?.creationTime || null,
        lastSignInTime: userData.metadata?.lastSignInTime || null,
      },
    };

    Cookies.set("user", JSON.stringify(safeUser), { expires: 7 });
    setUserState(safeUser);
  };

  const logout = () => {
    Cookies.remove("user");
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);