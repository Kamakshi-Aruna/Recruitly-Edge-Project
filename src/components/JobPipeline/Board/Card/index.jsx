import { useState } from "react";
import { Button, Card, Flex, Popover, Tooltip, Typography } from "antd";
import { useQueryClient } from "react-query";

import CardFooter from "@components/JobPipeline/Board/Card/Footer.jsx";
import { executePipelineAction } from "@components/JobPipeline/utils.jsx";
import { Draggable } from "@hello-pangea/dnd";

import { PIPELINE_ACTION_NAMES } from "../../constants.jsx";
import useSelectItems from "../../hooks/useSelectItems.js";

import CardContent from "./Content.jsx";
import CardHeader from "./Header.jsx";

const { Text } = Typography;

const JobPipelineCard = ({ data, index, style, isGlobalView }) => {
  const item = data[index];

  const [isMouseDown, setIsMouseDown] = useState(false);

  const queryClient = useQueryClient();

  const { handleSelectItem, isCardChecked } = useSelectItems({ item });

  if (!item) {
    return null;
  }

  const isInterviewIconVisible = item?.statusCode === "INTERVIEW" && !item.rejected;

  const cardStyles = {
    height: "100%",
    position: "relative",
    borderRadius: 10,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    backgroundColor: item.rejected ? "#fff4f5" : "white",
    display: "flex",
    flexDirection: "column",
  };

  const renderCard = () => (
    <Card
      hoverable
      style={{
        ...cardStyles,
        border: isMouseDown ? "2px dashed #0057ff" : "",
        cursor: isMouseDown ? "grab" : "default",
      }}
      styles={{ body: { padding: "0px" } }}
    >
      {isGlobalView && (
        <Flex style={{ borderBottom: "1px solid #efefef", height: "30px" }} align={"center"} justify={"start"}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "5px",
              width: "100%",
            }}
          >
            <Tooltip zIndex={999999999} title={item.job.name} overlayStyle={{ fontSize: "12px" }}>
              <Text
                title={"View job"}
                ellipsis={true}
                style={{
                  fontSize: "smaller",
                  fontWeight: "500",
                  padding: "10px",
                  flex: "1",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  executePipelineAction({
                    key: PIPELINE_ACTION_NAMES.VIEW_JOB,
                    selectedItems: [item.id],
                    queryClient: queryClient,
                  });
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: "#6b7483",
                  }}
                >
                  {item.job.reference}
                </span>{" "}
                {item.job.name}
              </Text>
            </Tooltip>
          </div>
        </Flex>
      )}
      <Flex align="center" justify="space-between" style={{ paddingRight: "15px", paddingLeft: "15px", paddingTop: "15px" }}>
        <CardHeader {...{ item, isCardChecked, handleSelectItem, isInterviewIconVisible }} />
      </Flex>
      <CardContent {...{ item }} style={{ flex: 1 }} />
      <CardFooter {...{ item }} />
    </Card>
  );

  const isDragDisabled = !!item.rejected;

  const renderPopOverContent = () => (
    <Flex style={{ maxWidth: "300px" }} vertical gap={10}>
      <Text>The candidate was marked as rejected for this role. Would you like to reconsider?</Text>
      <Button
        type="primary"
        onClick={() =>
          executePipelineAction({
            selectedItems: [item.id],
            key: item.jobApplication ? PIPELINE_ACTION_NAMES.APPROVE : PIPELINE_ACTION_NAMES.UNREJECT,
            queryClient,
          })
        }
      >
        Reconsider
      </Button>
    </Flex>
  );
  return (
    <Draggable draggableId={item.id} isDragDisabled={isDragDisabled} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
          style={{
            ...style,
            ...provided.draggableProps.style,
          }}
        >
          {isDragDisabled ? (
            <Popover content={renderPopOverContent()} title="Rejected" trigger="click" placement="right">
              {renderCard()}
            </Popover>
          ) : (
            renderCard()
          )}
        </div>
      )}
    </Draggable>
  );
};

JobPipelineCard.displayName = "JobPipelineCard";
export default JobPipelineCard;
