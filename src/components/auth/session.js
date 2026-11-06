import { createContext, useContext } from "react";

// Who's signed in, for anything inside the app: { id, email, name }. SignedIn fills it in.
export const SessionContext = createContext(null);

export const useSession = () => useContext(SessionContext);

// Up to two letters for the avatar: first and last name, or the email's first letter when there's no name.
export const initialsOf = (user) =>
  {
    const words = String(user?.name || "").trim().split(/\s+/).filter(Boolean);
    if(!words.length) return String(user?.email || "?").charAt(0).toUpperCase();
    const first = words[0].charAt(0);
    const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
    return `${first}${last}`.toUpperCase();
  };
