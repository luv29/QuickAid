import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

type NetworkStatusContextType = {
  isConnected: boolean;
  setNetworkStatus: (status: boolean) => void;
};

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isConnected: true,
  setNetworkStatus: () => { },
});

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Initial check
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(!!state.isConnected);
    };

    checkConnection();

    // Subscribe to network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setNetworkStatus = (status: boolean) => {
    setIsConnected(status);
  };

  return (
    <NetworkStatusContext.Provider value={{ isConnected, setNetworkStatus }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkStatusContext);