import { useEffect, useRef, useState } from "react";
import { Flex, Typography } from "antd";
import { useShallow } from "zustand/react/shallow";

import { DragDropContext } from "@hello-pangea/dnd";
import useResponsiveHeight from "@hooks/useResponsiveHeight.js";
import useEdgeInitializer from "@stores/useEdgeInitializer.js";
import useJobPipelineStore from "@stores/useJobPipelineStore.js";

import useDummyLoader from "../../../hooks/useDummyLoader.js";

import JobPipelineBoardColumnWrapper from "./Column/index.jsx";
import useDragAndDrop from "./hooks/useDragAndDrop.js";
import useSorting, { sortBoard } from "./hooks/useSorting.js";
import useColumnSortStore from "./stores/useColumnSortStore.js";
import JobPipelineReviewPopover from "./ReviewPopover.jsx";

const { Paragraph, Text } = Typography;

const JobPipelineBoardView = ({ loading, data, isFetching, boardCounts, columns, registerColumnRef, highlightedColumn, columnWidth, isGlobalView }) => {
  const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;

  const [board, setBoard] = useState(data);
  const [isLoading] = useDummyLoader({ loading });
  const sorting = useColumnSortStore((state) => state.sorting);

  const jobId = useEdgeInitializer(useShallow((state) => state.jobId));

  const { setSelectedItems, selectedItems } = useJobPipelineStore(useShallow((state) => ({ setSelectedItems: state.setSelectedItems, selectedItems: state.selectedItems })));

  useEffect(() => {
    if (isFlexiblePipeline) {
      const columnIds = columns?.map(({ id }) => id);

      setSelectedItems(
        selectedItems[jobId]?.filter(({ stateId }) => !!columnIds.includes(stateId)),
        jobId,
      );
    }
  }, [columns, isFlexiblePipeline]);

  useEffect(() => {
    if (!data) return;
    sortBoard(data, sorting, setBoard);
  }, [data, isFetching, setBoard, sorting]);

  useSorting({ board, setBoard });

  const containerRef = useRef(null);

  const maxHeight = useResponsiveHeight({ containerRef, offset: 20 });

  const { onDragEnd } = useDragAndDrop({
    isFlexiblePipeline,
    setBoard,
    board,
  });

  const getBackground = (item, snapshot) => {
    if (item.rejected) return "#fff4f5";
    if (snapshot.isDragging) return "#0052cc";
    return "#ffffff";
  };

  const renderClone = (provided, snapshot, rubric) => {
    const item = data[rubric.source.droppableId][rubric.source.index];
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          zIndex: 99999999999999,
          border: "2px solid #0052cc",
          marginBottom: "8px",
          background: getBackground(item, snapshot),
          borderRadius: "6px",
          cursor: "pointer",
          padding: "8px",
          boxShadow: "rgba(37, 41, 46, 0.12) 0px 3px 6px 0px",
          height: "max-content",
        }}
      >
        <div>
          <Flex gap="small" align="center" justify="space-between">
            <span>
              <span
                style={{
                  marginLeft: "0.25rem",
                  lineHeight: "2.5",
                  fontSize: "0.875rem",
                  color: snapshot.isDragging ? "white" : "darkslategray",
                }}
              >
                {item.rejected ? "Rejected" : item.candidate?.reference || "Pending"}
              </span>
            </span>
            {item.copilotReview.overallRelevancyScore > 0 && <JobPipelineReviewPopover item={item} />}
          </Flex>
          <Text strong ellipsis style={{ color: snapshot.isDragging ? "#ffffff" : "darkslategray" }}>
            {item.candidate.name}
          </Text>
          <Paragraph type="secondary" ellipsis style={{ color: snapshot.isDragging ? "#ffffff" : "darkslategray" }}>
            {item.candidate.email}
          </Paragraph>
        </div>
      </div>
    );
  };

  return (
    <Flex vertical gap="small">
      <div
        ref={containerRef}
        style={{
          display: "flex",
          maxHeight: maxHeight,
          justifyContent: "start",
          overflowX: "auto",
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          {columns?.map((column) => (
            <div
              key={column.id}
              style={{
                border: highlightedColumn === column.id ? "1px solid #1890ff" : "",
                backgroundColor: highlightedColumn === column.id ? "#e6f7ff" : "",
                transition: "all 0.3s ease",
                marginRight: "10px",
                marginTop: "10px",
                borderRadius: "6px",
              }}
              ref={(el) => registerColumnRef(column.id, el)}
            >
              <JobPipelineBoardColumnWrapper
                maxHeight={maxHeight}
                renderClone={renderClone}
                key={column.name}
                loading={isLoading}
                column={column}
                boardCounts={boardCounts}
                columnItems={board}
                columnWidth={columnWidth}
                isGlobalView={isGlobalView}
              />
            </div>
          ))}
        </DragDropContext>
      </div>
    </Flex>
  );
};

export default JobPipelineBoardView;
