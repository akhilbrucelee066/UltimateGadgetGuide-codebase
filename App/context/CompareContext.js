import React, { createContext, useState, useContext } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState([]);

  const addToCompare = (product) => {
    setCompareProducts((prev) => [...prev, product]);
  };

  const resetCompare = () => {
    setCompareProducts([]);
  };

  return (
    <CompareContext.Provider value={{ compareProducts, addToCompare, resetCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};