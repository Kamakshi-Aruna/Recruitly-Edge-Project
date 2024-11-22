import { useMutation, useQuery, useQueryClient } from "react-query";

import { fetchColumnNames, fetchPipelineData, fetchTableColumns, updateTableColumns } from "@api/jobPipeline";
import { filterJobData, getBoardData } from "@components/JobPipeline/utils.jsx";
import { getBoardCounts } from "@components/JobPipeline/utils.jsx";
import queryKeys from "@constants/queryKeys";

export const useFetchColumnNames = (options) => {
  const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;
  return useQuery([queryKeys.jobPipeline.columnNames], fetchColumnNames, {
    select: ({ data } = {}) => {
      return data?.map((column) => ({
        ...column,
        id: isFlexiblePipeline ? column._id : column.statusCode,
      }));
    },
    ...options,
  });
};

export const useFetchPipelineData = ({ jobId, filters, pipelineDataType, options = {} } = {}) => {
  const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;

  return useQuery(pipelineDataType ? [queryKeys.jobPipeline.pipelineData, pipelineDataType] : [queryKeys.jobPipeline.pipelineData, jobId], () => fetchPipelineData(jobId, pipelineDataType), {
    cacheTime: 0,
    staleTime: 0,
    select: ({ data }) => {
      const filteredData = filterJobData({ jobDataUnfiltered: data, ...filters, isFlexiblePipeline });
      const unfilteredData = data;
      const boardData = getBoardData(filteredData, { isFlexiblePipeline });
      const { counts, filteredCounts } = getBoardCounts(unfilteredData, filteredData, { isFlexiblePipeline });
      return { unfilteredData, filteredData, boardData, boardCounts: counts, filteredBoardCounts: filteredCounts };
    },
    enabled: !!jobId || !!pipelineDataType,
    ...options,
  });
};

export const useFetchJobPipelineTableColumns = () =>
  useQuery([queryKeys.jobPipeline.tableColumnNames], fetchTableColumns, {
    select: ({ data }) => data.sort((a, b) => a.orderNumber - b.orderNumber),
  });

export const useUpdateTableColumns = () => {
  const queryClient = useQueryClient();

  return useMutation(updateTableColumns, {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.jobPipeline.tableColumnNames]);
    },
  });
};
