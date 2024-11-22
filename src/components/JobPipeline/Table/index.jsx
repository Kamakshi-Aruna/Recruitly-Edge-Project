import { useEffect, useRef } from "react";
import { Layout, Table } from "antd";
import { useAntdColumnResize } from "react-antd-column-resize";
import { useQueryClient } from "react-query";
import { useShallow } from "zustand/react/shallow";

import { useFetchJobPipelineTableColumns, useUpdateTableColumns } from "@hooks/api/useJobPipelineApi.js";
import useResponsiveHeight from "@hooks/useResponsiveHeight.js";
import useEdgeInitializer from "@stores/useEdgeInitializer.js";
import useJobPipelineStore from "@stores/useJobPipelineStore.js";

import useDummyLoader from "../../../hooks/useDummyLoader.js";
import { PIPELINE_DATA_TYPE } from "../../GlobalPipeline/constants/index.jsx";
import { RECRUITLY__JOB_PIPELINE_TABLE_CANDIDATE_NAME_COLUMN_WIDTH_LS } from "../constants.jsx";
import { getTableColumns } from "../utils.jsx";

import "./styles.css";

const JobPipelineTableView = ({ data, loading, isGlobalView }) => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const { jobId, pipelineDataType } = useEdgeInitializer(useShallow((state) => ({ jobId: state.jobId, pipelineDataType: state.pipelineDataType })));

  const { data: columns, isLoading: isColumnsloading } = useFetchJobPipelineTableColumns();

  const [isLoading] = useDummyLoader({ loading: loading || isColumnsloading });

  const { mutate: updateTableColumns } = useUpdateTableColumns();

  const maxHeight = useResponsiveHeight({ containerRef, offset: 30 });

  const { selectedItems, setSelectedItems } = useJobPipelineStore(
    useShallow((state) => ({
      selectedItems: state.selectedItems,
      setSelectedItems: state.setSelectedItems,
    })),
  );

  const id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  const rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedItems[id] ?? [],
    onChange: (_, selectedRowData) => {
      setSelectedItems(
        selectedRowData.map(({ id }) => id),
        id,
      );
    },
  };

  const { resizableColumns, components, tableWidth } = useAntdColumnResize(() => {
    return { columns: getTableColumns(columns, queryClient, isGlobalView), minWidth: 100 };
  }, [columns, queryClient]);

  useEffect(() => {
    const currentColumnsData = getTableColumns(columns, queryClient, isGlobalView);

    if (!resizableColumns.length || !currentColumnsData.length) return;

    const isWidthChanged = resizableColumns.some((column, index) => {
      const currentColumn = currentColumnsData[index];
      return currentColumn?.width !== column.width;
    });

    if (!isWidthChanged) return;

    const columnWidths = resizableColumns.map(({ key, width }) => ({ dataField: key, width }));

    if (columnWidths) {
      localStorage.setItem(
        RECRUITLY__JOB_PIPELINE_TABLE_CANDIDATE_NAME_COLUMN_WIDTH_LS,
        columnWidths.find(({ dataField }) => dataField === "candidate.name"),
      );
      updateTableColumns(columnWidths);
    }
  }, [resizableColumns, columns, queryClient]);

  return (
    <Layout ref={containerRef} style={{ maxHeight: maxHeight, marginTop: ".5rem" }}>
      <Table
        showSorterTooltip={false}
        bordered={true}
        rowSelection={rowSelection}
        columns={resizableColumns}
        dataSource={isLoading ? [] : data}
        components={components}
        rowKey={(record) => record.id}
        pagination={false}
        loading={isLoading}
        virtual
        scroll={{ x: tableWidth, y: window.innerHeight - 150 }}
        onRow={(record) => {
          return {
            style: record.rejected ? { backgroundColor: "#ffebeb" } : {},
          };
        }}
      />
    </Layout>
  );
};

export default JobPipelineTableView;
