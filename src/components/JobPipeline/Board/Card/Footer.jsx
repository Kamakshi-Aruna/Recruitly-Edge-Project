import { Flex, List, Popover, Typography } from "antd";
import { useQueryClient } from "react-query";

import { getDateMoment } from "@utils/dateUtil.js";

import { PIPELINE_ACTION_NAMES } from "../../constants.jsx";

const { Text } = Typography;
import JobPipelineReviewPopover from "@components/JobPipeline/Board/ReviewPopover.jsx";
import { executePipelineAction } from "@components/JobPipeline/utils.jsx";

const CardFooter = ({ item }) => {
  const queryClient = useQueryClient();

  let state = item.statusLogs?.find((log) => log.currentStateId === item.stateId);

  // Build Actionable state...
  if (state) {
    state = {
      name: state.currentStateName,
      addedBy: state.addedBy?.name.split(" ")[0],
      addedOn: state.addedOn ? state.addedOn : item.modifiedOn,
    };
  } else {
    state = {
      name: item.stateName || item.statusName,
      addedBy: item.ownerName?.split(" ")[0] || "",
      addedOn: item.createdOn,
    };
  }

  const renderToolTipTitle = (item) => {
    const stateName = state.name;

    let userAndDate;

    if (item.jobApplication) {
      userAndDate = `Applied ${getDateMoment(state.addedOn)}`;

      if (item.candidateSource) {
        userAndDate = `${userAndDate} via ${item.candidateSource}`;
      }
    } else {
      if (item.statusLogs) {
        userAndDate = `Moved to ${stateName} by ${state.addedBy} ${getDateMoment(state.addedOn)}`;
      } else {
        userAndDate = `Added to ${stateName} by ${state.addedBy} ${getDateMoment(state.addedOn)}`;
      }
    }

    return userAndDate;
  };

  const parseColor = (color) => {
    if (color.startsWith("#")) {
      const bigint = parseInt(color.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    } else if (color.startsWith("rgb")) {
      return color.match(/\d+/g).slice(0, 3).map(Number);
    }
    return [255, 255, 255];
  };

  const getLuminance = ([r, g, b]) => {
    const [R, G, B] = [r, g, b].map((val) => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const getIdealTextColor = (stateColor) => {
    if (!stateColor) {
      return "#000000";
    }
    const bgColor = parseColor(stateColor);
    const luminance = getLuminance(bgColor);
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <Flex
      align={"start"}
      justify={"center"}
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: "0px 5px",
        borderTop: "1px solid #efefef",
        height: "35px",
      }}
      vertical
      gap={1}
    >
      <Flex align="center" justify="space-between" style={{ paddingRight: "0px", paddingLeft: "0px", paddingTop: "0px" }}>
        {item.copilotReview?.overallRelevancyScore > 0 && <JobPipelineReviewPopover item={item} />}
        <Flex align="center" gap={10} style={{ marginBottom: "0" }}>
          <List.Item style={{ padding: 0 }}>
            <Popover content={renderToolTipTitle(item)} overlayStyle={{ fontSize: "small" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "5px",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontWeight: 400,
                    fontSize: "11px",
                    color: getIdealTextColor(item.stateColor),
                    backgroundColor: item.stateColor,
                    textDecoration: "none",
                    padding: "0px 5px",
                    borderRadius: "10px",
                    display: "inline-block",
                    marginRight: "1px",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!item.jobApplication) {
                      executePipelineAction({
                        key: PIPELINE_ACTION_NAMES.UPDATE_SUBSTATUS,
                        selectedItems: [item.id],
                        queryClient,
                      });
                    }
                  }}
                >
                  {state.name ? state.name : "Applied"}
                </Text>
                <Text
                  ellipsis
                  color={"secondary"}
                  style={{
                    color: "#6b7483",
                    fontSize: "11px",
                    flex: "1",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.jobApplication ? `${getDateMoment(item.createdOn)} ${item.candidateSource ? `via ${item.candidateSource}` : ""}` : ` by ${state.addedBy} ${getDateMoment(state.addedOn)}`}
                </Text>
              </div>
            </Popover>
          </List.Item>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CardFooter;
