import { createContext, useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

type UserContextProps = {
  children: React.ReactNode;
};

type User = {
  id?: number;
  username?: string;
  email?: string;
  picture?: string;
};

type UserContextValues = {
  user: User | null;
  getUser: () => void;
};

const UserContext = createContext<UserContextValues>({} as UserContextValues);

export function useUser() {
  return useContext(UserContext);
}

function handleAxiosError(err: AxiosError) {
  if (err.response) {
    switch (err.response.data) {
      case "ER_DUPLICATE_KEY":
        return "Aledy in use!";
      default:
        if (typeof err.response.data === "string") {
          return err.response.data;
        }
    }
  }
  return err.message;
}

export function UserContextProvider({ children }: UserContextProps) {
  const [user, setUser] = useState<User | null>(null);

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        withCredentials: true,
      });
      setUser(data);
    } catch (err) {
      console.error(err);
      let errorMessage = "Something went wrong >:(";
      if (axios.isAxiosError(err)) errorMessage = handleAxiosError(err);
      console.log(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <UserContext.Provider value={{ user, getUser }}>
      {children}
    </UserContext.Provider>
  );
}
