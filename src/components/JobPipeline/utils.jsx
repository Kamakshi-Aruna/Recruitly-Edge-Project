import { Badge, Button, Dropdown, Flex, Space, Tag, Tooltip, Typography } from "antd";
import Fuse from "fuse.js";
import { BiRefresh } from "react-icons/bi";
import { FaEdit, FaRegComments } from "react-icons/fa";
import { LuKanban } from "react-icons/lu";
import { PiEye, PiGraduationCap, PiListChecks, PiMicrophone, PiRepeat, PiThumbsDown, PiThumbsUp, PiUserCircle } from "react-icons/pi";

import { EllipsisOutlined, TableOutlined } from "@ant-design/icons";
import queryKeys from "@constants/queryKeys";
import {
  ChartLine,
  ChatCircleDots,
  Clipboard,
  EnvelopeSimple,
  Export,
  FastForward,
  FilePdf,
  Folder,
  HandArrowDown,
  HandArrowUp,
  Notepad,
  PresentationChart,
  TrashSimple,
  TreeStructure,
  User,
} from "@phosphor-icons/react";
import { dateRanges } from "@utils/dateUtil.js";

import useEdgeInitializer from "../../stores/useEdgeInitializer";
import useJobPipelineStore from "../../stores/useJobPipelineStore";
import { PIPELINE_DATA_TYPE } from "../GlobalPipeline/constants";
import useUserActivityStore from "../GlobalPipeline/stores/userActivityStore";

import JobPipelineReviewPopover from "./Board/ReviewPopover";
import { DATE_FILTER_FIELD_OPTIONS } from "./DateFilter/constants";
import { USER_FILTER_TYPES } from "./FilterDropdown/utils";
import {
  PIPELINE_ACTION_NAMES,
  RECRUITLY__JOB_PIPELINE_TABLE_CANDIDATE_NAME_COLUMN_WIDTH_LS,
  RECRUITLY__JOB_PIPELINE_TABLE_JOB_NAME_COLUMN_WIDTH_LS,
  STATE_FILTER_TYPES,
  VIEW_MODES,
} from "./constants";

const { Text, Link } = Typography;

export const extractFilters = (data = [], showRejected) => {
  const usersCountMap = new Map();
  const statusCountMap = new Map();

  if (data.length === 0) return { users: [], statuses: [] };

  data.forEach((item) => {
    if (!showRejected && item.rejected) return;

    try {
      const userName = item.candidateOwnerName;
      usersCountMap.set(userName, (usersCountMap.get(userName) || 0) + 1);

      const { statusCode } = item;
      const statusKey = `${statusCode}`;
      statusCountMap.set(statusKey, (statusCountMap.get(statusKey) || 0) + 1);
    } catch (error) {
      console.error("Error processing item:", error, item);
    }
  });

  return {
    users: Array.from(usersCountMap.entries()),
    statuses: Array.from(statusCountMap.entries()),
  };
};

export const filterJobData = ({ jobDataUnfiltered, searchValue, stateFilter, usersFilter, dateFilter, userTypeFilter, statusFilter, isFlexiblePipeline = false, rejectReasonsFilter }) => {
  try {
    let data = [...jobDataUnfiltered];

    data = filterByRejection(data, stateFilter);
    data = filterByStatus(data, statusFilter, { isFlexiblePipeline });
    data = filterByRejectReason(data, rejectReasonsFilter);
    data = filterByUsers(data, usersFilter, userTypeFilter);
    if (dateFilter.type && dateFilter.filterData && dateFilter.filterData.dateRange) {
      data = filterByDate(data, dateFilter);
    }

    if (searchValue && searchValue.trim() !== "") {
      data = fuzzySearch(data, searchValue);
    }

    return data;
  } catch (e) {
    console.error("filterdata", e);
  }
};

const filterByRejection = (data, stateFilter) => {
  if (stateFilter === STATE_FILTER_TYPES.all) return data;
  if (stateFilter === STATE_FILTER_TYPES.active) return data.filter((pipeCard) => !pipeCard.rejected);
  if (stateFilter === STATE_FILTER_TYPES.rejected) return data.filter((pipeCard) => !!pipeCard.rejected);
  return data;
};

export const filterByUsers = (data, usersFilter, userTypeFilter) => {
  const requiredUserFilters = usersFilter
    .map((user) => {
      const firstDashIndex = user.indexOf("-");
      if (firstDashIndex !== -1) {
        const team = user.slice(0, firstDashIndex).trim();
        const userId = user.slice(firstDashIndex + 1).trim();
        return { team, userId: userId.toLowerCase() };
      }
      return null;
    })
    .filter(Boolean);

  if (!requiredUserFilters || requiredUserFilters.length === 0) return data;

  const filterMap = {
    [USER_FILTER_TYPES.PIPELINE_OWNER]: (pipeCard) => requiredUserFilters.some(({ userId }) => userId === pipeCard.ownerId),
    [USER_FILTER_TYPES.CANDIDATE_OWNER]: (pipeCard) => requiredUserFilters.some(({ userId }) => userId === pipeCard.candidateOwnerId),
    [USER_FILTER_TYPES.JOB_OWNER]: (pipeCard) => requiredUserFilters.some(({ userId }) => userId === pipeCard.jobOwnerId),
    [USER_FILTER_TYPES.ALL]: (pipeCard) =>
      requiredUserFilters.some(({ userId }) => [pipeCard.jobOwnerId, pipeCard.candidateOwnerId, pipeCard.ownerId].some((ownerName) => userId === ownerName?.toLowerCase())),
  };

  const filterFunc = filterMap[userTypeFilter] || filterMap[USER_FILTER_TYPES.ALL];

  return data.filter(filterFunc);
};

const filterByStatus = (data, statusFilter, { isFlexiblePipeline = false } = {}) => {
  if (!statusFilter || statusFilter.length === 0) return data;

  return data.filter((pipeCard) =>
    statusFilter.some((filterItem) => {
      const index = filterItem.indexOf("-");
      const filterStatusName = index !== -1 ? filterItem.slice(0, index) : filterItem;
      const filterStateId = index !== -1 ? filterItem.slice(index + 1) : "";

      if (isFlexiblePipeline) {
        return filterStateId === pipeCard.stateId;
      }
      return filterStatusName === pipeCard.statusCode && filterStateId === pipeCard.stateId;
    }),
  );
};

const filterByRejectReason = (data, reasonFilter) => {
  if (!reasonFilter || reasonFilter.length === 0) return data;

  const validFilters = reasonFilter.filter((filter) => filter.includes("-"));

  if (validFilters.length === 0) return data;

  return data.filter(({ statusCode, reasonId }) =>
    validFilters.some((filter) => {
      const index = filter.indexOf("-");
      const filterStatusName = filter.slice(0, index);
      const filterReasonId = filter.slice(index + 1);

      const matchesStatus = statusCode === filterStatusName;
      const matchesReason = reasonId === filterReasonId;

      return matchesStatus && matchesReason;
    }),
  );
};

const fuzzySearch = (data, searchValue) => {
  const fuse = new Fuse(data, {
    keys: ["candidate.name", "job.title", "candidate.email", "candidate.phone", "candidate.reference", "stateName", "job.reference"],
    threshold: 0.3,
  });
  const fuzzyResults = fuse.search(searchValue);
  return fuzzyResults.map((result) => result.item);
};

const getDateFilterField = (item) => ({
  [DATE_FILTER_FIELD_OPTIONS.PIPELINE_LAST_MODIFIED]: item.modifiedOn,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_CONTACTED]: item.candidateActivity?.lastContacted,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_EMAIL]: item.candidateActivity?.recentEmail,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_NOTE]: item.candidateActivity?.recentNote,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_SMS]: item.candidateActivity?.recentSMS,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_EVENT]: item.candidateActivity?.recentEvent,
  [DATE_FILTER_FIELD_OPTIONS.CANDIDATE_LAST_TASK]: item.candidateActivity?.recentTask,
});

const filterByDate = (data, dateFilter) => {
  const { filterData } = dateFilter;
  const filterFields = filterData.filterBy;
  const dateRange = filterData.dateRange;
  const { start, end } = dateRange && dateRange === "CUSTOM" ? filterData.customDate : dateRanges[dateRange];

  return data.filter((item) => {
    return filterFields.some((fieldName) => {
      const itemDate = getDateFilterField(item)[fieldName];
      if (!itemDate) return false;
      return itemDate >= start && itemDate <= end;
    });
  });
};

export const getBoardData = (data, { isFlexiblePipeline = false }) => {
  const grouped = data.reduce((acc, pipeCard) => {
    const columnId = !isFlexiblePipeline ? pipeCard.statusCode : pipeCard.stateId;

    if (!acc[columnId]) {
      acc[columnId] = [];
    }

    acc[columnId].push(pipeCard);
    return acc;
  }, {});

  Object.keys(grouped).forEach((columnId) => {
    grouped[columnId].sort((a, b) => new Date(b.modifiedOn) - new Date(a.modifiedOn));
  });

  return grouped;
};
export const getBoardCounts = (data, filteredData, { isFlexiblePipeline = false }) => {
  const counts = data.reduce((acc, pipeCard) => {
    const columnId = !isFlexiblePipeline ? pipeCard.statusCode : pipeCard.stateId;

    if (!acc[columnId]) {
      acc[columnId] = { rejected: 0, active: 0, all: 0 };
    }

    if (pipeCard.rejected) {
      acc[columnId].rejected += 1;
    } else {
      acc[columnId].active += 1;
    }
    acc[columnId].all += 1;

    return acc;
  }, {});

  const filteredCounts = filteredData?.reduce((acc, pipeCard) => {
    const columnId = !isFlexiblePipeline ? pipeCard.statusCode : pipeCard.stateId;
    acc[columnId] = (acc[columnId] || 0) + 1;
    return acc;
  }, {});

  return { counts, filteredCounts };
};

export const createMenuItems = (options) => {
  return options.map(([item, count]) => ({
    key: item,
    label: `${item} (${count})`,
  }));
};

export const executePipelineAction = ({ key, selectedItems, queryClient }) => {
  const edgeUtil = window.EDGE_UTIL;

  const jobId = useEdgeInitializer.getState().jobId;
  const pipelineDataType = useEdgeInitializer.getState().pipelineDataType;
  const isGlobalPipeline = useJobPipelineStore.getState().isGlobalPipeline;

  let id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  if (isGlobalPipeline) {
    const lastViewed = useUserActivityStore.getState()?.lastViewed;
    if (lastViewed) {
      id = lastViewed.id;
    }
  }

  if (!edgeUtil) {
    console.warn("Edge util is not set.");
  }

  console.log("-------- Selected item ids: ", selectedItems);

  let queryData = queryClient.getQueryData([queryKeys.jobPipeline.pipelineData, id]);

  const data = queryData.data;

  const selectedItemsData = data?.filter(({ id }) => selectedItems.includes(id));
  console.log(`-------- Selected items:`, selectedItemsData);

  return edgeUtil.jobPipelineAction({
    actionCode: key,
    paramsObj: {
      records: selectedItemsData,
    },
  });
};

export const getJobPipelineActions = (selectedItems, queryClient) => {
  const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;
  const execute = (key) =>
    executePipelineAction({
      key,
      selectedItems,
      queryClient,
    });

  let actions = [
    {
      key: PIPELINE_ACTION_NAMES.ADD_EXEC_REPORT,
      title: "Exec report",
      icon: () => <PresentationChart size={18} />,
      action: () => execute(PIPELINE_ACTION_NAMES.ADD_EXEC_REPORT),
    },
    {
      key: PIPELINE_ACTION_NAMES.ADD_NOTE,
      title: "Notes",
      icon: () => <Notepad size={18} />,
      action: () => execute(PIPELINE_ACTION_NAMES.ADD_NOTE),
    },
    {
      key: "SEND_EMAIL",
      title: "Email",
      icon: () => <EnvelopeSimple size={18} />,
      action: () => execute(PIPELINE_ACTION_NAMES.SEND_EMAIL),
    },
    {
      key: "SEND_SMS",
      title: "Sms",
      icon: () => <ChatCircleDots size={18} />,
      action: () => execute(PIPELINE_ACTION_NAMES.SEND_SMS),
    },
    {
      key: "UPDATE_STATUS",
      title: "Status",
      icon: () => <FastForward size={18} />,
      action: () => (isFlexiblePipeline ? execute(PIPELINE_ACTION_NAMES.UPDATE_SUBSTATUS) : execute(PIPELINE_ACTION_NAMES.DLG_UPDATE_STATUS)),
    },
  ];

  if (!isFlexiblePipeline) {
    actions.push({
      key: "SUB_STATE",
      title: "Sub state",
      icon: () => <ChartLine size={18} />,
      action: () => execute(PIPELINE_ACTION_NAMES.UPDATE_SUBSTATUS),
    });
  }

  return actions;
};

export const getMoreBulkActions = (selectedItems, queryClient) => {
  const execute = (key) =>
    executePipelineAction({
      key,
      selectedItems,
      queryClient,
    });
  return [
    {
      key: "SHARE_CV",
      label: "Share CV",
      icon: <FilePdf size={18} />,
      onClick: () => execute(PIPELINE_ACTION_NAMES.SUBMIT_CV),
    },
    {
      key: "ADD_SEQUENCE",
      label: "Sequence",
      icon: <TreeStructure size={18} />,
      onClick: () => execute(PIPELINE_ACTION_NAMES.ADD_SEQUENCE),
    },
    {
      key: "FOLDERS",
      icon: <Folder size={18} />,
      label: <span>Folders</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.ADD_FOLDER),
    },
    {
      key: "UPDATE_OWNER",
      icon: <User size={18} />,
      label: <span>Update owner</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.UPDATE_OWNER),
    },
    {
      key: "REJECT",
      icon: <HandArrowDown size={18} />,
      label: <span>Reject</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.REJECT),
    },
    {
      key: "UNREJECT",
      icon: <HandArrowUp size={18} />,
      label: <span>Unreject</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.UNREJECT),
    },
    {
      key: "MOVE",
      icon: <Clipboard size={18} />,
      label: <span>Move/Copy to job</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.REASSIGN),
    },
    {
      key: "EXPORT",
      icon: <Export size={18} />,
      label: <span>Export</span>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.EXPORT),
    },
    {
      type: "divider",
    },
    {
      key: "REMOVE",
      icon: <TrashSimple color="red" size={18} />,
      label: <Text type="danger">Remove</Text>,
      onClick: () => execute(PIPELINE_ACTION_NAMES.REMOVE),
    },
  ];
};

export const getItemActions = (item, queryClient) => {
  const isFlexiblePipeline = !!window.COOL_GLOBALS?.USER?.dynamicPipelinesEnabled;

  const execute = (key, e) => {
    e.stopPropagation?.();
    executePipelineAction({
      selectedItems: [item.id],
      key,
      queryClient,
    });
  };

  const jobApplicationActions = [
    {
      label: "Approve",
      key: PIPELINE_ACTION_NAMES.APPROVE,
      icon: <PiThumbsUp size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.APPROVE, e),
    },
    {
      label: "Reject",
      key: PIPELINE_ACTION_NAMES.REJECT,
      icon: <PiThumbsDown size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.REJECT, e),
    },
    {
      label: "Reassign",
      key: PIPELINE_ACTION_NAMES.REASSIGN,
      icon: <PiRepeat size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.REASSIGN, e),
    },
  ];

  const rejectedActions = [
    {
      label: "Unreject",
      key: PIPELINE_ACTION_NAMES.UNREJECT,
      icon: <PiThumbsUp size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.UNREJECT, e),
    },
  ];

  const execReportAction = {
    label: "Executive Report",
    key: PIPELINE_ACTION_NAMES.ADD_EXEC_REPORT,
    icon: <PresentationChart size="18" />,
    onClick: (e) => execute(PIPELINE_ACTION_NAMES.ADD_EXEC_REPORT, e),
  };

  const rejectAction = {
    label: "Reject",
    key: PIPELINE_ACTION_NAMES.REJECT,
    icon: <PiThumbsDown size="18" />,
    onClick: (e) => execute(PIPELINE_ACTION_NAMES.REJECT, e),
  };

  const regularActions = [
    {
      label: (
        <Flex vertical>
          <Space direction="vertical" size={0} style={{ lineHeight: "1.2" }}>
            <Space align="center" size={4}>
              <PiGraduationCap color="black" size="18" />
              <Text strong>{item.candidate.name}</Text>
            </Space>
            <Text type="secondary">{item.candidate.email}</Text>
            <Text type="secondary">{item.candidate.lastContacted}</Text>
            <Text type="secondary">{item.candidate.dateApplied}</Text>
            <Text type="secondary">{item.candidate.source}</Text>
          </Space>
        </Flex>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      label: "Submit CV",
      key: PIPELINE_ACTION_NAMES.SUBMIT_CV,
      icon: <FilePdf size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.SUBMIT_CV, e),
    },
    {
      label: "View CV",
      key: PIPELINE_ACTION_NAMES.VIEW_CANDIDATE_CV,
      icon: <PiEye size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.VIEW_CANDIDATE_CV, e),
    },
    {
      label: "Update Status",
      key: PIPELINE_ACTION_NAMES.DLG_UPDATE_STATUS,
      icon: <FastForward size="18" />,
      onClick: (e) => (isFlexiblePipeline ? execute(PIPELINE_ACTION_NAMES.UPDATE_SUBSTATUS, e) : execute(PIPELINE_ACTION_NAMES.DLG_UPDATE_STATUS, e)),
    },
    {
      label: "Schedule Interview",
      key: PIPELINE_ACTION_NAMES.SCHEDULE_INTERVIEW,
      icon: <PiMicrophone size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.SCHEDULE_INTERVIEW, e),
    },
    {
      label: "Add to Sequence",
      key: PIPELINE_ACTION_NAMES.ADD_SEQUENCE,
      icon: <TreeStructure size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.ADD_SEQUENCE, e),
    },
    { type: "divider" },
    {
      label: "Add Task",
      key: PIPELINE_ACTION_NAMES.ADD_TASK,
      icon: <PiListChecks size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.ADD_TASK, e),
    },
    {
      label: "Update comments",
      key: PIPELINE_ACTION_NAMES.UPDATE_COMMENTS,
      icon: <FaRegComments size="18" />,
      onClick: (e) => execute(PIPELINE_ACTION_NAMES.UPDATE_COMMENTS, e),
    },
  ];

  if (item.jobApplication) {
    return [regularActions[0], ...jobApplicationActions, { type: "divider" }, ...regularActions.slice(6)];
  }

  if (item.rejected) {
    return [regularActions[0], regularActions[1], ...rejectedActions, ...regularActions.slice(6)];
  }

  return [regularActions[0], ...regularActions.slice(1), { type: "divider" }, execReportAction, rejectAction];
};

export const formatDate = (date) =>
  date.toLocaleDateString({
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatShortDate = (date) => {
  const currentDate = new Date();
  const options = {
    month: "short",
    day: "numeric",
  };

  if (date.getFullYear() !== currentDate.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString(undefined, options);
};

const DATA_FIELD_MAP = {
  pipeStatusName: "statusName",
  subStatus: "stateName",
  candidateOwner: "candidateOwnerName",
  source: "candidateSource",
};

const renderField = (item, queryClient, width) => ({
  candidateEmail: (
    <Tooltip title={item.candidate.email} overlayStyle={{ fontSize: 12 }}>
      <Text ellipsis style={{ maxWidth: width - 10 }}>
        {item.candidate?.email}
      </Text>
    </Tooltip>
  ),
  modifiedOn: formatDate(new Date(item.modifiedOn)),
  createdOn: formatDate(new Date(item.createdOn)),
  comments: (
    <div className="comment-cell" style={{ height: "100%" }}>
      <Flex align={"center"} gap="small" style={{ height: "100%" }}>
        {item.review?.comments ? (
          <Text>{item.review.comments}</Text>
        ) : (
          <Text
            type="secondary"
            style={{ cursor: "pointer", fontSize: 12 }}
            onClick={() =>
              executePipelineAction({
                selectedItems: [item.id],
                key: PIPELINE_ACTION_NAMES.UPDATE_COMMENTS,
                queryClient,
              })
            }
          >
            Add comment
          </Text>
        )}
        {item.review?.comments && (
          <>
            <FaEdit
              style={{ cursor: "pointer" }}
              className="edit-comment-button"
              onClick={() =>
                executePipelineAction({
                  selectedItems: [item.id],
                  key: PIPELINE_ACTION_NAMES.UPDATE_COMMENTS,
                  queryClient,
                })
              }
            />
          </>
        )}
      </Flex>
    </div>
  ),
  subStatus: (
    <Tag
      style={{ cursor: "pointer" }}
      color={item.stateColor}
      onClick={() =>
        executePipelineAction({
          key: PIPELINE_ACTION_NAMES.UPDATE_SUBSTATUS,
          selectedItems: [item.id],
          queryClient,
        })
      }
    >
      <Text style={{ fontSize: 12, color: item.stateFontColor }}>{`${item.statusName} > ${item.stateName}`}</Text>
    </Tag>
  ),
});

const MIN_COLUMN_WIDTH = 100;
const MAX_COLUMN_WIDTH = 500;
export const getTableColumns = (columns, queryClient, isGlobalView) => {
  const candidateNameWidth = localStorage.getItem(RECRUITLY__JOB_PIPELINE_TABLE_CANDIDATE_NAME_COLUMN_WIDTH_LS);

  const jobeNameWidth = localStorage.getItem(RECRUITLY__JOB_PIPELINE_TABLE_JOB_NAME_COLUMN_WIDTH_LS);

  let staticColumns = [
    {
      title: "Candidate",
      key: "candidate.label",
      render: (record) => (
        <Flex align="center" gap="small" justify="space-between">
          <Flex align="center" gap="small">
            <Tooltip title={record.candidate?.name || ""} overlayStyle={{ fontSize: "12px" }}>
              <Link
                ellipsis
                style={{ width: candidateNameWidth - 60, alignItems: "center" }}
                onClick={() =>
                  executePipelineAction({
                    key: PIPELINE_ACTION_NAMES.VIEW_RECORD,
                    selectedItems: [record.id],
                    queryClient,
                  })
                }
              >
                {record.candidate?.name || ""}
              </Link>
            </Tooltip>

            {record.jobApplication && (
              <Tooltip title="Job application" overlayStyle={{ fontSize: "12px" }}>
                <PiUserCircle size={18} />
              </Tooltip>
            )}
          </Flex>

          <Flex>
            {record.copilotReview?.overallRelevancyScore > 0 && <JobPipelineReviewPopover item={record} />}
            <Dropdown size={"small"} menu={{ items: getItemActions(record, queryClient, isGlobalView) }}>
              <Button size={"small"} type="text" onClick={(e) => e.preventDefault()}>
                <EllipsisOutlined
                  style={{
                    fontSize: "20px",
                    fontWeight: "bolder",
                    color: "darkslategray",
                  }}
                />
              </Button>
            </Dropdown>
          </Flex>
        </Flex>
      ),
      fixed: "left",
      width: Math.min(Math.max(candidateNameWidth && candidateNameWidth !== "undefined" ? candidateNameWidth : 0, 250), MAX_COLUMN_WIDTH),
      ellipsis: true,
      sorter: (a, b) => a.candidate?.name.localeCompare(b.candidate?.name),
    },
  ];

  if (isGlobalView) {
    staticColumns.push({
      title: "Job",
      key: "job.name",
      render: (record) => (
        <Flex align="center" gap="small" justify="space-between">
          <Flex align="center" gap="small">
            <Tooltip title={record.job?.name || ""} overlayStyle={{ fontSize: "12px" }}>
              <Link
                ellipsis
                style={{ width: jobeNameWidth - 60, alignItems: "center" }}
                onClick={() =>
                  executePipelineAction({
                    key: PIPELINE_ACTION_NAMES.VIEW_JOB,
                    selectedItems: [record.id],
                    queryClient,
                  })
                }
              >
                {record.job?.name || ""}
              </Link>
            </Tooltip>
          </Flex>
        </Flex>
      ),
      fixed: "left",
      width: Math.min(Math.max(jobeNameWidth && jobeNameWidth !== "undefined" ? jobeNameWidth : 0, 250), MAX_COLUMN_WIDTH),
      ellipsis: true,
      sorter: (a, b) => a.job?.name.localeCompare(b.job?.name),
    });
  }

  return [
    ...staticColumns,
    ...(columns || []).map(({ caption, dataField, width, sortField, disableSorting }) => ({
      title: caption,
      dataIndex: DATA_FIELD_MAP?.[dataField] || dataField,
      key: dataField,
      render: (value, item) => renderField(item, queryClient, width, isGlobalView)?.[dataField] ?? value,
      width: Math.min(Math.max(width || 0, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH),
      sorter:
        !disableSorting && sortField
          ? (a, b) => {
              let valA = a[DATA_FIELD_MAP[sortField] ?? sortField];
              let valB = b[DATA_FIELD_MAP[sortField] ?? sortField];
              if (sortField === "candidateEmail") {
                valA = a.candidate?.email;
                valB = b.candidate?.email;
              }

              if (typeof valA === "string" && typeof valB === "string") {
                return valA.localeCompare(valB);
              }

              return valA - valB;
            }
          : undefined,
    })),
  ];
};

const createBadgeItem = (label, count, color, value) => {
  return {
    label: (
      <Flex style={{ padding: "42x" }} justify="center" align="center" gap={10}>
        {label} <Badge color={color} count={count} style={{ color: "#000", cursor: "pointer", boxShadow: `0 0 0 1px ${color}` }} showZero overflowCount={9999} />
      </Flex>
    ),
    key: value,
  };
};

export const stateSwitcherItems = ({ activeCandidatesCount, rejectedCandidatesCount, unfilteredDataCount }) => [
  createBadgeItem("Active", activeCandidatesCount || 0, "#ade0ac", STATE_FILTER_TYPES.active),
  createBadgeItem("Rejected", rejectedCandidatesCount || 0, "#ff7f7f", STATE_FILTER_TYPES.rejected),
  createBadgeItem("All", unfilteredDataCount || 0, "#D3D3D3", STATE_FILTER_TYPES.all),
];

export const getActiopnsMenuItems = (viewMode, refetch) => [
  {
    key: "EDIT_STAGES",
    label: viewMode === VIEW_MODES.kanban ? "Edit stages" : "Columns",
    icon: viewMode === VIEW_MODES.kanban ? <LuKanban size="18" /> : <TableOutlined size="18" />,
    onClick: () =>
      viewMode === VIEW_MODES.kanban ? window.RECRUITLY_JS?.JOBPIPE_COLUMNS.showPipelineGridColumnChooser() : window.RECRUITLY_JS?.GRID_COLUMNS.showGridColumnChooser("JOB_PIPELINE", true),
  },
  {
    key: "RELOAD",
    label: "Reload",
    icon: <BiRefresh size="18" />,
    onClick: refetch,
  },
];

export const formatSelectedItems = (item) => {
  return {
    id: item.id,
    jobId: item.job?.id,
    candidateId: item.candidate?.id,
    statusCode: item.statusCode,
    stateId: item.stateId,
  };
};
