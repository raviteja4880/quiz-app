import React, { createContext, useState } from "react";

export const ResultsContext = createContext();

export const ResultsProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <ResultsContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </ResultsContext.Provider>
  );
};
