import { message } from "antd";
import { useQueryClient } from "react-query";

import { fetchPipelineCardData } from "@api/jobPipeline.js";
import queryKeys from "@constants/queryKeys";
import useEdgeInitializer from "@stores/useEdgeInitializer.js";

import useJobPipelineStore from "../../../../stores/useJobPipelineStore";
import { PIPELINE_DATA_TYPE } from "../../../GlobalPipeline/constants";
import useUserActivityStore from "../../../GlobalPipeline/stores/userActivityStore";
import { PIPELINE_ACTION_NAMES } from "../../constants";
import { executePipelineAction } from "../../utils";

const useDragAndDrop = ({ isFlexiblePipeline, setBoard, board }) => {
  const queryClient = useQueryClient();
  let jobId = useEdgeInitializer((state) => state.jobId);
  let pipelineDataType = useEdgeInitializer((state) => state.pipelineDataType);
  const isGlobalPipeline = useJobPipelineStore.getState().isGlobalPipeline;

  let id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  if (isGlobalPipeline) {
    const lastViewed = useUserActivityStore.getState()?.lastViewed;
    if (lastViewed) {
      id = lastViewed.id;
    }
  }

  const updateQueryData = ({ destinationColumnId, pipeCardId, newPipeCard }) => {
    queryClient.setQueryData([queryKeys.jobPipeline.pipelineData, id], (prevData) => {
      const data = prevData?.data || [];

      const cardToUpdate = data.find((card) => card.id === pipeCardId);

      if (cardToUpdate) {
        const updatedCard = newPipeCard ? structuredClone(newPipeCard) : structuredClone(cardToUpdate);

        updatedCard[isFlexiblePipeline ? "stateId" : "statusCode"] = destinationColumnId;

        const updatedData = data.map((card) => (card.id === pipeCardId ? updatedCard : card));

        return { data: updatedData, success: true };
      }

      return prevData;
    });
  };

  const findPipelineCardById = (columnItems, id) => {
    for (const key in columnItems) {
      const found = columnItems[key].find((item) => item.id === id);
      if (found) return found;
    }
    return null;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId: pipeCardId } = result;

    if (!destination || source.droppableId === destination.droppableId) return;

    const pipeCard = findPipelineCardById(board, pipeCardId);

    if (pipeCard.jobApplication) {
      executePipelineAction({
        selectedItems: [pipeCard.id],
        key: PIPELINE_ACTION_NAMES.VIEW_RECORD,
        queryClient,
        isGlobalPipeline,
      });
      return;
    }

    if (pipeCard.rejected) {
      message.info("This application is already rejected. Please approve the candidate to proceed.");
      return;
    }
    const destinationColumnId = destination.droppableId;
    const sourceColumnId = source.droppableId;

    const sourceItems = Array.from(board[sourceColumnId] || []);
    const destinationItems = Array.from(board[destinationColumnId] || []);

    sourceItems.splice(source.index, 1);

    destinationItems.splice(destination.index, 0, pipeCard);

    updateQueryData({ destinationColumnId, pipeCardId });
    setBoard({ ...board, [sourceColumnId]: sourceItems, [destinationColumnId]: destinationItems });

    try {
      const resp = await window.EDGE_UTIL.jobPipelineAction({
        actionCode: "UPDATE_STATUS",
        paramsObj: {
          sourceStatus: sourceColumnId,
          destStatus: destinationColumnId,
          flexiblePipeline: isFlexiblePipeline,
          records: [pipeCard],
        },
      });

      console.log("Vista_response", resp);

      const { data: newPipeCard } = await fetchPipelineCardData(pipeCardId);
      updateQueryData({ destinationColumnId, pipeCardId, newPipeCard });
    } catch (error) {
      console.error({ error });
      sourceItems.splice(source.index, 0, pipeCard);
      destinationItems.splice(destination.index, 1);
      updateQueryData({ destinationColumnId: sourceColumnId, pipeCardId });
      setBoard({
        ...board,
        [sourceColumnId]: sourceItems,
        [destinationColumnId]: destinationItems,
      });
    }
  };

  return { onDragEnd };
};

export default useDragAndDrop;
