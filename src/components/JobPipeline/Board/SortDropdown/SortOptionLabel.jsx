import { Button, Flex, Space, Typography } from "antd";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react";

import { SORT_ORDERS } from "../constants";
import useColumnSortStore from "../stores/useColumnSortStore";

const { Text } = Typography;

const SortOptionLabel = ({ sortKey, label, handleSort, columnId }) => {
  const sorting = useColumnSortStore((state) => state.sorting);

  const isAsc = sorting[columnId]?.key === sortKey && sorting[columnId]?.order === SORT_ORDERS.asc;
  const isDesc = sorting[columnId]?.key === sortKey && sorting[columnId]?.order === SORT_ORDERS.desc;

  const onChange = (value) => handleSort({ key: sortKey, order: value });

  const startBtnStyle = {
    borderRight: "1px solid lightgrey",
    borderColor: "lightgrey",
    flexGrow: 1,
    borderRadius: "15px 0 0 15px",
    backgroundColor: "white",
  };

  const endBtnStyle = {
    borderRight: "1px solid lightgrey",
    borderColor: "lightgrey",
    flexGrow: 1,
    borderRadius: "0 15px 15px 0",
    backgroundColor: "white",
  };
  return (
    <Flex align="center" gap="small" justify="space-between" style={{ width: "100%", paddingBottom: 5 }}>
      <Text>{label}</Text>
      <Space.Compact wrap style={{ width: "80px" }}>
        <Button
          style={{ ...startBtnStyle, flexGrow: 1 }}
          size={"small"}
          color="primary"
          variant="filled"
          icon={<ArrowUp size={20} color={isAsc ? "black" : "#B0B0B0"} />}
          onClick={() => onChange(SORT_ORDERS.asc)}
        />
        <Button
          style={{ ...endBtnStyle, flexGrow: 1 }}
          size="small"
          color="primary"
          variant="filled"
          icon={<ArrowDown size={20} color={isDesc ? "black" : "#B0B0B0"} />}
          onClick={() => onChange(SORT_ORDERS.desc)}
        />
      </Space.Compact>
    </Flex>
  );
};

export default SortOptionLabel;
