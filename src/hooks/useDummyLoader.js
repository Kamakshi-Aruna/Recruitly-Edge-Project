import { useEffect, useState } from "react";

const useDummyLoader = ({ loading }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  return [isLoading, setIsLoading];
};

export default useDummyLoader;
