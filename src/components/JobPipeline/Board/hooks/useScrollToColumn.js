import { useRef, useState } from "react";

const useScrollToColumn = () => {
  const columnRefs = useRef({});

  const [highlightedColumn, setHighlightedColumn] = useState(null);

  const registerColumnRef = (id, ref) => {
    columnRefs.current[id] = ref;
  };
  const handleScrollToColumn = (id) => {
    const columnElement = columnRefs.current[id];

    if (columnElement) {
      columnElement.scrollIntoView({ block: "nearest", inline: "center" });

      setHighlightedColumn(id);

      setTimeout(() => {
        setHighlightedColumn(null);
      }, 1000);
    }
  };
  return { highlightedColumn, registerColumnRef, handleScrollToColumn };
};

export default useScrollToColumn;
