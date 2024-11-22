import { useEffect, useState } from "react";

import { Droppable } from "@hello-pangea/dnd";

import { RECRUITLY__JOB_PIPELINE_BOARD_COLUMN_WIDTH_LS } from "../../constants.jsx";

import JobPipelineBoardColumn from "./Content.jsx";

const JobPipelineBoardColumnWrapper = ({ renderClone, column, columnItems, boardCounts, loading, columnWidth, maxHeight, isGlobalView }) => {
  const [debouncedWidth, setDebouncedWidth] = useState(columnWidth);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedWidth(columnWidth);
    }, 100);

    return () => {
      clearTimeout(handler);
    };
  }, [columnWidth]);

  useEffect(() => {
    localStorage.setItem(RECRUITLY__JOB_PIPELINE_BOARD_COLUMN_WIDTH_LS, debouncedWidth);
  }, [debouncedWidth, column.id]);

  const isFlexiblePipeline = window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;

  return (
    <Droppable renderClone={renderClone} key={column.id} droppableId={column.id} mode="virtual">
      {(provided, snapshot) => {
        const containerStyle = {
          height: maxHeight - 20,
          padding: "10px",
          borderRadius: "6px",
          width: `${debouncedWidth}px`,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s",
          ...(snapshot.isDraggingOver
            ? {
                backgroundColor: "#E5EFFDFF",
                border: "2px solid #007BFF99",
              }
            : {
                backgroundImage: "linear-gradient(145deg, rgb(231, 241, 255) 28%, rgb(226 226 255))",
                border: "1px solid rgb(200 219 245)",
              }),
        };
        return (
          <div {...provided.droppableProps} ref={provided.innerRef} style={containerStyle}>
            <JobPipelineBoardColumn
              loading={loading}
              column={column}
              columnItems={columnItems[column.id]}
              boardCounts={boardCounts[column.id]}
              snapshot={snapshot}
              flexibleColumn={isFlexiblePipeline}
              isGlobalView={isGlobalView}
            />
          </div>
        );
      }}
    </Droppable>
  );
};

export default JobPipelineBoardColumnWrapper;
