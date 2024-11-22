import { Button, Dropdown } from "antd";
import { useQueryClient } from "react-query";

import { EllipsisOutlined } from "@ant-design/icons";

import { getItemActions } from "../../utils";

const JobPipelineBoardCardActions = ({ item }) => {
  const queryClient = useQueryClient();
  return (
    <Dropdown size={"small"} menu={{ items: getItemActions(item, queryClient) }} getPopupContainer={() => document.getElementById("card-list")}>
      <Button
        size={"small"}
        type="text"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <EllipsisOutlined
          style={{
            fontSize: "20px",
            fontWeight: "bolder",
            color: "darkslategray",
          }}
        />
      </Button>
    </Dropdown>
  );
};

export default JobPipelineBoardCardActions;
