import { useEffect } from "react";
import { useQueryClient } from "react-query";

import { fetchPipelineCardsData } from "@api/jobPipeline";
import queryKeys from "@constants/queryKeys";
import useEdgeInitializer from "@stores/useEdgeInitializer.js";
import useJobPipelineStore from "@stores/useJobPipelineStore";

import { PIPELINE_DATA_TYPE } from "../../GlobalPipeline/constants";

const EDGE_EVENTS = {
  ADD_EXEC_REPORT: "EDGE_PIPELINE_ADD_EXEC_REPORT",
  ADD_SEQUENCE: "EDGE_PIPELINE_ADD_SEQUENCE",
  UPDATE_STATUS: "EDGE_PIPELINE_UPDATE_STATUS",
  UPDATE_SUBSTATUS: "EDGE_PIPELINE_UPDATE_SUBSTATUS",
  SUBMIT_CV: "EDGE_PIPELINE_SUBMIT_CV",
  ADD_FOLDER: "EDGE_PIPELINE_ADD_FOLDER",
  UPDATE_OWNER: "EDGE_PIPELINE_UPDATE_OWNER",
  APPROVE: "EDGE_PIPELINE_APPROVE",
  REJECT: "EDGE_PIPELINE_REJECT",
  UNREJECT: "EDGE_PIPELINE_UNREJECT",
  REASSIGN: "EDGE_PIPELINE_REASSIGN",
  EXPORT: "EDGE_PIPELINE_EXPORT",
  SCHEDULE_INTERVIEW: "EDGE_PIPELINE_SCHEDULE_INTERVIEW",
  EDIT_STAGES: "EDGE_PIPELINE_UPDATE_COLUMN",
  UPDATE_TABLE_COLUMNS: "EDGE_GRID_COLUMNS_UPDATED",
  REMOVE: "EDGE_PIPELINE_REMOVE",
  UPDATE_COMMENTS: "EDGE_PIPELINE_COMMENTS",
};

const EDGE_PIPELINE_KANBAN_COLUMNS = "EDGE_PIPELINE_KANBAN_COLUMNS";

export const useEdgeEvents = () => {
  const queryClient = useQueryClient();
  const clearSelectedItems = useJobPipelineStore((state) => state.clearSelectedItems);

  const handlePipelineEvent = async (event) => {
    const jobId = useEdgeInitializer.getState()?.jobId;
    const pipelineDataType = useEdgeInitializer.getState()?.pipelineDataType;

    const id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

    const eventData = event.detail;

    console.log("EDGE_EVENT_RECEIVED", event.type, eventData);

    let cleanedEventData = [];
    try {
      cleanedEventData = eventData.map((item) => {
        let parsedItem = item;

        if (typeof parsedItem === "string") {
          parsedItem = JSON.parse(parsedItem); // Parse to an object
        }

        return parsedItem;
      });
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
      cleanedEventData = eventData;
    }

    if (event.type === EDGE_PIPELINE_KANBAN_COLUMNS) {
      queryClient.invalidateQueries([queryKeys.jobPipeline.columnNames]);
      return;
    }
    if (event.type === EDGE_EVENTS.EDIT_STAGES) {
      queryClient.invalidateQueries([queryKeys.jobPipeline.columnNames]);
      return;
    }

    if (event.type === EDGE_EVENTS.UPDATE_TABLE_COLUMNS && cleanedEventData?.[0]?.module === "JOB_PIPELINE") {
      queryClient.invalidateQueries([queryKeys.jobPipeline.tableColumnNames]);
      return;
    }

    if (event.type === EDGE_EVENTS.REASSIGN) {
      const candidateIdsToRemove = cleanedEventData.flatMap(({ pipeline, copied }) => (!copied ? pipeline.map(({ candidateId }) => candidateId) : []));
      queryClient.setQueryData([queryKeys.jobPipeline.pipelineData, id], (prevData) => {
        const jobPipelineData = prevData?.data || [];

        const updatedJobPipelineData = jobPipelineData.filter(({ candidate }) => !candidateIdsToRemove.includes(candidate?.id));

        return { ...prevData, data: updatedJobPipelineData };
      });
      clearSelectedItems(id);
      return;
    }

    if (event.type === EDGE_EVENTS.REMOVE) {
      const pipelinesToRemove = cleanedEventData.map(({ id }) => id);
      queryClient.setQueryData([queryKeys.jobPipeline.pipelineData, id], (prevData) => {
        const jobPipelineData = prevData?.data || [];

        const updatedJobPipelineData = jobPipelineData.filter(({ id }) => !pipelinesToRemove.includes(id));

        return { ...prevData, data: updatedJobPipelineData };
      });
      clearSelectedItems(id);
      return;
    }

    const pipeCardIds = cleanedEventData.map(({ id }) => id);
    if (!pipeCardIds) return;

    const { data: updatedPipelineCards } = await fetchPipelineCardsData(pipeCardIds);

    const findIndices = (data, jobPipelineData) => data.map((item) => jobPipelineData.findIndex((pipeline) => pipeline?.id === item?.id))?.filter((index) => index !== -1);

    queryClient.setQueryData([queryKeys.jobPipeline.pipelineData, id], (prevData) => {
      const jobPipelineData = prevData?.data || [];

      if (!jobPipelineData) {
        console.warn("Job pipeline data is not returned in API");
        return prevData;
      }

      const cardsToUpdate = findIndices(cleanedEventData, jobPipelineData);

      const updatedJobPipelineData = structuredClone(jobPipelineData);

      cardsToUpdate.forEach((index) => {
        const cardId = updatedJobPipelineData[index].id;
        const updatedCardData = updatedPipelineCards.find((card) => card.id === cardId);

        if (updatedCardData) {
          updatedJobPipelineData[index] = structuredClone(updatedCardData);
        }
      });
      clearSelectedItems(id);

      return { data: updatedJobPipelineData, success: true };
    });
  };

  useEffect(() => {
    let eventNames = Object.values(EDGE_EVENTS);
    const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;

    if (isFlexiblePipeline) {
      eventNames.push(EDGE_PIPELINE_KANBAN_COLUMNS);
    }

    eventNames.forEach((eventName) => {
      window.addEventListener(eventName, handlePipelineEvent);
    });

    return () => {
      eventNames.forEach((eventName) => {
        window.removeEventListener(eventName, handlePipelineEvent);
      });
    };
  }, [queryClient]);
};
