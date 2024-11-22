import { useEffect, useState } from "react";

import { debounce } from "../utils";

const useResponsiveHeight = ({ containerRef, offset = 20 }) => {
  const [maxHeight, setMaxHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateMaxHeight = () => {
      if (containerRef.current) {
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        console.log({ offsetTop });
        setMaxHeight(window.innerHeight - offsetTop - offset);
      }
    };

    const debouncedUpdate = debounce(updateMaxHeight, 100);

    debouncedUpdate();

    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [containerRef]);

  return maxHeight;
};

export default useResponsiveHeight;
