'use client';

import { createContext, FC, ReactNode, useContext, useEffect } from 'react';
interface VariableContextInterface {
  storageProvider: 'local' | 'cloudflare';
  backendUrl: string;
  isSecured: boolean;
  disableImageCompression: boolean;
  transloadit: string[];
}
const VariableContext = createContext({
  storageProvider: 'local',
  backendUrl: '',
  isSecured: false,
  disableImageCompression: false,
  transloadit: [],
} as VariableContextInterface);
export const VariableContextComponent: FC<
  VariableContextInterface & {
    children: ReactNode;
  }
> = (props) => {
  const { children, ...otherProps } = props;
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.vars = otherProps;
    }
  }, []);
  return (
    <VariableContext.Provider value={otherProps}>
      {children}
    </VariableContext.Provider>
  );
};
export const useVariables = () => {
  return useContext(VariableContext);
};
export const loadVars = () => {
  // @ts-ignore
  return window.vars as VariableContextInterface;
};
