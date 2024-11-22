import { Button, Card, Flex, Popover, Space, Tooltip, Typography } from "antd";
import { BiMailSend } from "react-icons/bi";
import { BsEnvelopeExclamationFill } from "react-icons/bs";
import { FaCalendarPlus, FaFileAlt, FaLinkedin } from "react-icons/fa";
import { MdCalendarMonth, MdContentCopy, MdEmail, MdLocalPhone, MdPhoneDisabled } from "react-icons/md";
import { PiTreeViewFill } from "react-icons/pi";
import { useQueryClient } from "react-query";

import { Buildings } from "@phosphor-icons/react";
import { getDateStringByUserTimeZone } from "@utils/dateUtil.js";

import { PIPELINE_ACTION_NAMES } from "../../constants";
import { executePipelineAction } from "../../utils";

const { Text, Link } = Typography;

const CardContent = ({ item }) => {
  const queryClient = useQueryClient();

  const buttonStyle = {
    borderRight: "1px solid white",
    borderColor: "#ffffff",
    flexGrow: 1,
    backgroundColor: "#efefef",
  };

  const startBtnStyle = {
    borderRight: "1px solid white",
    borderColor: "#ffffff",
    flexGrow: 1,
    borderRadius: "15px 0 0 15px",
    backgroundColor: "#efefef",
  };

  const endBtnStyle = {
    borderRight: "1px solid white",
    borderColor: "#ffffff",
    flexGrow: 1,
    borderRadius: "0 15px 15px 0",
    backgroundColor: "#efefef",
  };

  const highlightBtn = {
    borderRadius: "12px",
    border: "1px dashed secondary !important",
    textDecoration: "underline",
    color: "grey",
    fontSize: "11px",
    hover: { color: "#000000" },
  };

  const applicationReviewBtn = {
    borderRadius: "15px",
    border: "1px dashed green !important",
    textDecoration: "none",
  };

  const placementCreateBtn = (item) => {
    return {
      borderRadius: "15px",
      border: item.placementPending ? "1px salmon !important" : "1px darkseagreen !important",
      textDecoration: "none",
      color: "white !important",
      backgroundColor: item.placementPending ? "salmon" : "darkseagreen",
    };
  };

  const handleCallClick = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const renderEmailOptions = (item) => {
    if (item) {
      return (
        <Flex vertical gap={"small"}>
          <Card
            style={{ border: 0 }}
            actions={[
              <Button
                key=""
                size={"small"}
                type={"primary"}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  executePipelineAction({
                    key: PIPELINE_ACTION_NAMES.SEND_EMAIL,
                    selectedItems: [item.id],
                    queryClient,
                  });
                }}
              >
                <BiMailSend /> Send email
              </Button>,
              <Button
                key=""
                style={{ backgroundColor: "cadetblue", color: "white" }}
                variant={"filled"}
                size={"small"}
                onClick={(e) => {
                  e.stopPropagation();
                  executePipelineAction({
                    key: item.hasSequence ? PIPELINE_ACTION_NAMES.VIEW_PIPELINE_SEQUENCE : PIPELINE_ACTION_NAMES.ADD_SEQUENCE,
                    selectedItems: [item.id],
                    queryClient,
                  });
                }}
              >
                <PiTreeViewFill /> Outreach
              </Button>,
            ]}
          >
            <Card.Meta
              style={{ padding: 0 }}
              description={
                <Text
                  ellipsis
                  copyable={{
                    text: item.candidate?.email.toLowerCase(),
                    icon: [<MdContentCopy key="copy" />],
                  }}
                >
                  {item.candidate?.email.toLowerCase()}
                </Text>
              }
            />
          </Card>
        </Flex>
      );
    } else {
      return null;
    }
  };

  const handleLinkedInBtnEvnt = (item) => {
    if (!item || !item.candidate) {
      return;
    }

    if (item.candidate?.linkedInUrl) {
      window.open(item.candidate.linkedInUrl, "_blank");
    } else if (item.candidate?.linkedInUid) {
      window.open(`https://linkedin.com/in/${item.candidate.linkedInUid}`, "_blank");
    } else {
      const [firstName, surname] = item.candidate.name.split(" ");

      window.open(`https://www.linkedin.com/search/results/people/?firstName=${firstName}&lastName=${surname}`);
    }
  };

  const canShowInterviewEvent = item.statusCode === "INTERVIEW" && !item.rejected;

  return (
    <div style={{ paddingRight: "15px", paddingLeft: "15px" }}>
      <Flex vertical style={{ flexGrow: 1, marginTop: 10, marginBottom: 10, width: "100%" }} gap="small">
        <Space.Compact wrap style={{ width: "100%" }}>
          {/* Send Email Button */}
          {item.candidate?.email ? (
            <Popover content={renderEmailOptions(item, queryClient)} title={"Email"}>
              <Button
                style={{ ...startBtnStyle, flexGrow: 1 }}
                size="small"
                color="primary"
                variant="filled"
                icon={item.candidate.email ? <MdEmail size="20" color="palevioletred" /> : <BsEnvelopeExclamationFill size="18" color="secondary" />}
                onClick={() => {}}
              />
            </Popover>
          ) : (
            <Tooltip zIndex={9999} title={"Email not available"} overlayStyle={{ fontSize: "12px" }}>
              <Button
                style={{ ...startBtnStyle, flexGrow: 1 }}
                size="small"
                disabled={!item.candidate.email}
                color="primary"
                variant="filled"
                icon={item.candidate.email ? <MdEmail size="20" color="dodgerblue" /> : <BsEnvelopeExclamationFill size="18" color="secondary" />}
                onClick={() => {}}
              />
            </Tooltip>
          )}

          {/* Phone Button */}
          <Tooltip zIndex={9999} title={item.candidate?.phone ? "Phone" : "Phone not available"} overlayStyle={{ fontSize: "12px" }}>
            <Button
              style={{ ...buttonStyle, flexGrow: 1 }}
              size="small"
              disabled={!item.candidate.phone}
              color="primary"
              variant="filled"
              icon={item.candidate.phone ? <MdLocalPhone size="20" color="LightSeaGreen" /> : <MdPhoneDisabled size="20" color="secondary" />}
              onClick={() => {
                item.candidate?.phone ? handleCallClick(item.candidate?.phone) : "";
              }}
            />
          </Tooltip>

          {/* View CV Button */}
          <Tooltip zIndex={9999} title="View CV" overlayStyle={{ fontSize: "12px" }}>
            <Button
              style={{ ...buttonStyle, flexGrow: 1 }}
              size="small"
              color="primary"
              variant="filled"
              icon={<FaFileAlt size="20" color="cadetblue" />}
              onClick={() =>
                executePipelineAction({
                  key: PIPELINE_ACTION_NAMES.VIEW_CANDIDATE_CV,
                  selectedItems: [item.id],
                  queryClient,
                })
              }
            />
          </Tooltip>

          {/* Add to Sequence / View Sequence Button */}
          <Tooltip zIndex={9999} title={item.hasSequence ? "View sequence" : "Add to sequence"} overlayStyle={{ fontSize: "12px" }}>
            <Button
              style={{ ...buttonStyle, flexGrow: 1 }}
              size="small"
              color="primary"
              variant="filled"
              icon={<PiTreeViewFill size="20" color={item.hasSequence ? "#aeea00" : "#9e9e9e"} />}
              onClick={(e) => {
                e.stopPropagation();
                executePipelineAction({
                  key: item.hasSequence ? PIPELINE_ACTION_NAMES.VIEW_PIPELINE_SEQUENCE : PIPELINE_ACTION_NAMES.ADD_SEQUENCE,
                  selectedItems: [item.id],
                  queryClient,
                });
              }}
            />
          </Tooltip>

          {/* LinkedIn Button */}
          <Tooltip zIndex={9999} title={item.candidate?.linkedInUrl || item.candidate?.linkedInUid ? "View in linkedIn" : "Search in linkedIn"} overlayStyle={{ fontSize: "12px" }}>
            <Button
              type="link"
              style={{ ...endBtnStyle, flexGrow: 1 }}
              size="small"
              color="primary"
              variant="filled"
              icon={<FaLinkedin size="20" color={item.candidate?.linkedInUrl || item.candidate?.linkedInUid ? "#0077B5" : "SlateGray"} />}
              onClick={() => {
                handleLinkedInBtnEvnt(item);
              }}
            />
          </Tooltip>
        </Space.Compact>
      </Flex>

      <Flex vertical style={{ flexGrow: 1, marginTop: 10, marginBottom: 10 }} gap={0} justify="center">
        {item.candidateLinkedEmployerName && (
          <Flex align="center" gap="small">
            <Buildings color="cadetblue" />
            <Tooltip title={item.candidateLinkedEmployerName} overlayStyle={{ fontSize: 12 }}>
              {item.candidateLinkedEmployerId ? (
                <Link
                  ellipsis
                  color={"cadetblue"}
                  style={{ fontSize: 12, color: "cadetblue", fontWeight: 500 }}
                  key={item.candidateLinkedEmployerId}
                  onClick={() => {
                    executePipelineAction({
                      key: PIPELINE_ACTION_NAMES.VIEW_COMPANY,
                      selectedItems: [item.id],
                      queryClient,
                    });
                  }}
                >
                  {item.candidateLinkedEmployerName}
                </Link>
              ) : (
                <Text ellipsis color={"cadetblue"} style={{ marginBottom: 0, fontSize: 12, fontWeight: 500 }}>
                  {item.candidateLinkedEmployerName}
                </Text>
              )}
            </Tooltip>
          </Flex>
        )}

        {canShowInterviewEvent &&
          (item.interviewEvent ? (
            <Flex align="center" gap="small">
              <MdCalendarMonth color="cadetblue" />
              <Tooltip title={"View interviews"} overlayStyle={{ fontSize: 12 }}>
                <Text
                  ellipsis
                  style={{ marginBottom: 0, fontSize: 12 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    executePipelineAction({
                      key: PIPELINE_ACTION_NAMES.VIEW_PIPELINE_INTERVIEW,
                      selectedItems: [item.id],
                      queryClient,
                    });
                  }}
                >
                  Interview on {getDateStringByUserTimeZone(item.interviewDate, "Do MMM [at] HH:mm")}
                </Text>
              </Tooltip>
            </Flex>
          ) : (
            <Flex align="center" gap="small">
              <FaCalendarPlus color="cadetblue" />
              <Tooltip title={"Schedule interview"} overlayStyle={{ fontSize: 12 }}>
                <Text
                  style={{
                    marginBottom: 0,
                    fontSize: 12,
                    textDecoration: "underline",
                    color: "#8c8c8c",
                  }}
                  ellipsis
                  onClick={(e) => {
                    e.stopPropagation();
                    executePipelineAction({
                      key: PIPELINE_ACTION_NAMES.SCHEDULE_INTERVIEW,
                      selectedItems: [item.id],
                      queryClient,
                    });
                  }}
                >
                  Schedule Interview
                </Text>
              </Tooltip>
            </Flex>
          ))}
      </Flex>
      <Flex vertical gap="small" style={{ width: "100%" }}>
        {/* eslint-disable-next-line no-nested-ternary */}
        {item.jobApplication ? (
          <Button
            style={applicationReviewBtn}
            type="text"
            color="primary"
            variant="filled"
            size="small"
            block
            onClick={(e) => {
              e.stopPropagation();
              executePipelineAction({
                key: PIPELINE_ACTION_NAMES.VIEW_RECORD,
                selectedItems: [item.id],
                queryClient,
              });
            }}
          >
            Review Application
          </Button>
        ) : /* eslint-disable-next-line no-nested-ternary */
        item.statusCode === "PLACED" ? (
          <Button
            style={placementCreateBtn(item)}
            type="link"
            color="default"
            variant="filled"
            size="small"
            block
            onClick={(e) => {
              e.stopPropagation();
              executePipelineAction({
                key: item.placementPending ? PIPELINE_ACTION_NAMES.ADD_PLACEMENT : PIPELINE_ACTION_NAMES.VIEW_PLACEMENT,
                selectedItems: [item.id],
                queryClient,
              });
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "smaller",
              }}
            >
              {item.placementPending ? "Create Placement" : "View " + item.placementRef}
            </span>
          </Button>
        ) : item.review?.comments ? (
          <Tooltip zIndex={999999} overlayStyle={{ fontSize: "11px" }} title={"Update highlight"}>
            <Link
              ellipsis
              style={{
                borderRadius: "12px",
                padding: "5px",
                width: "100%",
                border: "1px dashed secondary !important",
                textDecoration: "none",
                color: "inherit",
                fontSize: "12px",
                backgroundColor: "lightgoldenrodyellow",
              }}
              block
              onClick={(e) => {
                e.stopPropagation();
                executePipelineAction({
                  key: PIPELINE_ACTION_NAMES.UPDATE_COMMENTS,
                  selectedItems: [item.id],
                  queryClient,
                });
              }}
            >
              {item.review?.comments}
            </Link>
          </Tooltip>
        ) : (
          <Button
            style={highlightBtn}
            type="link"
            color="default"
            variant="dashed"
            size="small"
            block
            onClick={(e) => {
              e.stopPropagation();
              executePipelineAction({
                key: PIPELINE_ACTION_NAMES.UPDATE_COMMENTS,
                selectedItems: [item.id],
                queryClient,
              });
            }}
          >
            Add a highlight
          </Button>
        )}
      </Flex>
    </div>
  );
};

export default CardContent;
