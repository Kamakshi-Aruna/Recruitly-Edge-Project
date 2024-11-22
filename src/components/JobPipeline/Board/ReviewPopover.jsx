import { Button, Flex, Popover, Progress } from "antd";
import { PiQuestionFill, PiSealCheckFill, PiThumbsDownFill } from "react-icons/pi";
import { useQueryClient } from "react-query";

import { PIPELINE_ACTION_NAMES } from "../constants";
import { executePipelineAction } from "../utils";

const JobPipelineReviewPopover = ({ item }) => {
  const queryClient = useQueryClient();
  const getColor = (score) => {
    if (score > 90) return "forestgreen";
    if (score > 80) return "lightgreen";
    if (score > 70) return "orange";
    return "red";
  };

  return (
    <Popover
      trigger="click"
      title={
        <Flex justify="space-between" align="center">
          <span>Copilot Review</span>
          <span>
            <Button size="small" onClick={() => executePipelineAction({ key: PIPELINE_ACTION_NAMES.VIEW_RECORD, selectedItems: [item.id], queryClient })}>
              View
            </Button>
            {!item.rejected && (
              <Button
                style={{ marginLeft: 6 }}
                size="small"
                color="danger"
                variant="solid"
                onClick={() => executePipelineAction({ key: PIPELINE_ACTION_NAMES.REJECT, selectedItems: [item.id], queryClient })}
              >
                Reject
              </Button>
            )}
          </span>
        </Flex>
      }
      content={() => (
        <div
          style={{
            maxWidth: 400,
            maxHeight: 300,
            overflowY: "auto",
            padding: 12,
          }}
        >
          <p dangerouslySetInnerHTML={{ __html: item.copilotReview.assessment }} />
        </div>
      )}
    >
      <div style={{ display: "flex", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
        {item.copilotReview.overallRelevancyScore >= 91 && <PiSealCheckFill style={{ color: "forestgreen", marginRight: 8 }} />}
        {item.copilotReview.overallRelevancyScore >= 85 && item.copilotReview.overallRelevancyScore < 91 && <PiQuestionFill style={{ color: "lightgreen", marginRight: 8 }} />}
        {item.copilotReview.overallRelevancyScore < 85 && <PiThumbsDownFill style={{ color: "orange", marginRight: 8 }} />}
        <Progress
          steps={5}
          size="small"
          percent={item.copilotReview.overallRelevancyScore}
          showInfo={false}
          strokeColor={getColor(item.copilotReview.overallRelevancyScore)}
          style={{ marginRight: 8 }}
        />
      </div>
    </Popover>
  );
};

export default JobPipelineReviewPopover;
