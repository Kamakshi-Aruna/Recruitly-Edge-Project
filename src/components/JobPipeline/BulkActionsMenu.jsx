import { Button, Dropdown, Flex, Grid, Space, Tooltip, Typography } from "antd";
import { IoMdClose } from "react-icons/io";
import { useQueryClient } from "react-query";
import { useShallow } from "zustand/react/shallow";

import { DownOutlined } from "@ant-design/icons";
import useEdgeInitializer from "@stores/useEdgeInitializer";
import useJobPipelineStore from "@stores/useJobPipelineStore";

import { PIPELINE_DATA_TYPE } from "../GlobalPipeline/constants";

import { getJobPipelineActions, getMoreBulkActions } from "./utils";

const { useBreakpoint } = Grid;

const { Link } = Typography;

const JobPipelineBulkActionsMenu = ({ isGlobalPipeline }) => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();
  const { jobId, pipelineDataType } = useEdgeInitializer(useShallow((state) => ({ jobId: state.jobId, pipelineDataType: state.pipelineDataType })));
  const { selectedItems, clearSelectedItems } = useJobPipelineStore(useShallow((state) => ({ selectedItems: state.selectedItems, clearSelectedItems: state.clearSelectedItems })));
  const id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  const buttonColors = {
    background: "#2a3f97",
    borderColor: "#5567b5",
    color: "white",
  };

  return (
    selectedItems[id]?.length > 0 && (
      <Flex align={"center"} gap={"small"}>
        <Link strong>{selectedItems[id]?.length} selected</Link>
        <Space.Compact gap={"small"}>
          <>
            {getJobPipelineActions(selectedItems[id] || [], queryClient, isGlobalPipeline).map(({ title, icon: Icon, action, key }) => (
              <Tooltip zIndex={999999999} title={title} key={key}>
                <Button style={{ width: "max-content", padding: !screens.xxl && "8px", ...buttonColors }} size="small" type="default" variant="solid" icon={<Icon />} onClick={action} block>
                  {screens.xxl && title}
                </Button>
              </Tooltip>
            ))}
            <Dropdown menu={{ items: getMoreBulkActions(selectedItems[id], queryClient, isGlobalPipeline) }} placement="topLeft" style={{ width: "100%" }}>
              <Button style={buttonColors} variant="solid" size="small" iconPosition={"end"} onClick={(e) => e.preventDefault()} icon={<DownOutlined />}>
                <span>More actions</span>
              </Button>
            </Dropdown>
          </>
        </Space.Compact>
        <Button type="text" icon={<IoMdClose size={18} />} style={{ marginLeft: "10px", height: "32px" }} onClick={() => clearSelectedItems(id)}>
          Clear
        </Button>
      </Flex>
    )
  );
};

export default JobPipelineBulkActionsMenu;
