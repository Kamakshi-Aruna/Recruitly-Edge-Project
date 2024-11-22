import { useEffect } from "react";
import { QueryClientProvider } from "react-query";
import { useShallow } from "zustand/react/shallow";

import useEdgeInitializer from "@stores/useEdgeInitializer";

import queryClient from "./queryClient";

const ApiProvider = ({ apiKey, apiServer, jobId, children }) => {
  const { setApiCredentials } = useEdgeInitializer(
    useShallow((state) => ({
      setApiCredentials: state.setApiCredentials,
    })),
  );
  useEffect(() => {
    console.log("------- Setting up Edge utils --------");
    console.log({
      apiKey,
      apiServer,
      jobId,
    });
    setApiCredentials({ apiKey, apiServer, jobId });
  }, [apiKey, setApiCredentials]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ApiProvider;
