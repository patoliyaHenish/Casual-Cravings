import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMyProfileQuery } from '../features/api/authApi';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);


  const { data, isSuccess, isLoading, isError, error } = useMyProfileQuery();

   useEffect(() => {
      if (isSuccess && data?.user) {
        setUser(data.user);
      } else if (isError) {
        if(error?.status === 401 || error?.status === 403) {
          setUser(null);
        }
      }
  }, [isSuccess, data, isError, error]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);