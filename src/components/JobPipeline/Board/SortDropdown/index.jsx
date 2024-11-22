import { Button, Dropdown } from "antd";

import { SortAscendingOutlined } from "@ant-design/icons";

import { SORT_ORDERS, SORT_TYPES } from "../constants.jsx";
import useColumnSortStore from "../stores/useColumnSortStore.js";
import { getSortOptions } from "../utils.jsx";

const SortDropdown = ({ columnId, handleColumnSort }) => {
  const sorting = useColumnSortStore((state) => state.sorting);

  const isSortingDefault = sorting[columnId]?.key === SORT_TYPES.last_activity && sorting[columnId]?.order === SORT_ORDERS.desc;

  return (
    <Dropdown
      menu={{
        items: getSortOptions({ handleSort: handleColumnSort, order: sorting[columnId]?.order, columnId }),
      }}
      style={{ width: "100%" }}
    >
      <Button
        type="secondary"
        size="small"
        iconPosition="end"
        onClick={(e) => e.preventDefault()}
        icon={<SortAscendingOutlined color={isSortingDefault ? "#B0BEC5" : "#4CAF50"} style={{ marginRight: 10, cursor: "pointer", color: isSortingDefault ? "gray" : "#4CAF50" }} />}
      />
    </Dropdown>
  );
};

export default SortDropdown;
