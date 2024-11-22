import { Badge, Checkbox, Flex, Skeleton, Space, Tooltip, Typography } from "antd";
import { FixedSizeList as List } from "react-window";

import useJobPipelineStore from "../../../../stores/useJobPipelineStore.js";
import { STATE_FILTER_TYPES } from "../../constants.jsx";
import useSelectItems from "../../hooks/useSelectItems.js";
import JobPipelineCard from "../Card/index.jsx";
import SortDropdown from "../SortDropdown/index.jsx";
import useColumnSortStore from "../stores/useColumnSortStore.js";

const { Text } = Typography;

const JobPipelineBoardColumn = ({ loading, columnItems, column, snapshot, flexibleColumn, boardCounts, isGlobalView }) => {
  const { isColumnChecked, IsColumnIndeterminate, onSelectAll } = useSelectItems({
    columnItems,
  });

  const stateFilter = useJobPipelineStore((state) => state.filters.stateFilter);

  const highlightActive = [STATE_FILTER_TYPES.active, STATE_FILTER_TYPES.all].includes(stateFilter);
  const highlightRejected = [STATE_FILTER_TYPES.rejected, STATE_FILTER_TYPES.all].includes(stateFilter);

  const setSorting = useColumnSortStore((state) => state.setSorting);

  const handleColumnSort = ({ key, order = null }) => setSorting(column.id, key, order);

  return (
    <>
      <Flex style={{ marginBottom: ".5em", paddingRight: 8 }} align="center" justify="space-between">
        <Flex align="center" style={{ width: "100%" }}>
          <Flex align="center" style={{ flex: 1, whiteSpace: "nowrap" }}>
            <Text ellipsis={{ tooltip: column.name }} strong style={{ whiteSpace: "nowrap", maxWidth: 125 }}>
              {column.name}
            </Text>
            <Space>
              &nbsp;
              <Tooltip zIndex={999999999} title="Active candidates" overlayStyle={{ fontSize: "12px" }}>
                <Badge color={highlightActive ? "#ade0ac" : "#d3d3d3"} count={boardCounts?.active || 0} style={{ color: "#000", boxShadow: "none" }} showZero overflowCount={9999} />
              </Tooltip>
              <Tooltip zIndex={999999999} title="Rejected candidates" overlayStyle={{ fontSize: "12px" }}>
                <Badge
                  color={highlightRejected ? "#ff7f7f" : "#d3d3d3"}
                  count={boardCounts?.rejected || 0}
                  style={{ color: highlightRejected ? "white" : "#000", cursor: "pointer", boxShadow: "none" }}
                  showZero
                  overflowCount={9999}
                />
              </Tooltip>
            </Space>
          </Flex>
        </Flex>
        <SortDropdown columnId={column.id} handleColumnSort={handleColumnSort} />
        <Checkbox indeterminate={IsColumnIndeterminate} title="Select all" onChange={({ target: { checked } }) => onSelectAll(checked)} checked={isColumnChecked} />
      </Flex>
      <div
        style={{
          overflow: "hidden",
          flexGrow: 1,
          marginBottom: "1rem",
          marginTop: ".2rem",
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} title={false} paragraph={{ rows: 3 }} style={{ marginBottom: "1rem" }} shape="square" active />)
        ) : (
          <List
            id="card-list"
            style={{
              overflowX: "hidden",
              paddingBottom: "20rem",
            }}
            height={window.innerHeight * 0.9}
            itemCount={snapshot.isUsingPlaceholder ? columnItems?.length + 1 : columnItems?.length || 0}
            itemSize={isGlobalView ? 290 : 270}
            overscanCount={2}
            itemData={columnItems || []}
          >
            {({ index, style, data }) => (
              <JobPipelineCard
                index={index}
                style={{
                  ...style,
                  height: style.height - 10,
                }}
                data={data}
                flexibleColumn={flexibleColumn}
                isGlobalView={isGlobalView}
              />
            )}
          </List>
        )}
      </div>
    </>
  );
};

export default JobPipelineBoardColumn;
