import { memo, useEffect, useMemo, useState } from "react";
import { Badge, Button, Dropdown, Flex, Input, Layout, Segmented, Slider, Space, Tooltip, Typography } from "antd";
import { AiOutlineUser } from "react-icons/ai";
import { BiBuilding, BiUser } from "react-icons/bi";
import { BsFillKanbanFill, BsTable } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { IoShareSocial } from "react-icons/io5";
import { PiUserMinus } from "react-icons/pi";

import { EyeOutlined } from "@ant-design/icons";
import { fetchJobData } from "@api/jobPipeline.js";
import { fetchUserList } from "@api/user.js";
import { useFetchColumnNames, useFetchPipelineData } from "@hooks/api/useJobPipelineApi.js";
import { FunnelSimple } from "@phosphor-icons/react";
import useJobPipelineStore, { useViewModeStore } from "@stores/useJobPipelineStore.js";

import { PIPELINE_DATA_TYPE } from "../GlobalPipeline/constants/index.jsx";

import useScrollToColumn from "./Board/hooks/useScrollToColumn.js";
import JobPipelineBoardView from "./Board/index.jsx";
import DateFilter from "./DateFilter/index.jsx";
import FilterDropdown from "./FilterDropdown/index.jsx";
import { buildRejectReasonTree, buildStatusTree, buildUserTree, USER_FILTER_TYPE_SELECTOR, USER_FILTER_TYPES } from "./FilterDropdown/utils.js";
import { useEdgeEvents } from "./hooks/useEdgeEvents.js";
import JobPipelineBulkActionsMenu from "./BulkActionsMenu.jsx";
import { JOB_PIPELINE_FILTERS, RECRUITLY__JOB_PIPELINE_BOARD_COLUMN_WIDTH_LS, STATE_FILTER_TYPES, VIEW_MODES } from "./constants.jsx";
import JobPipelineTableView from "./Table";
import { getActiopnsMenuItems, stateSwitcherItems } from "./utils.jsx";

const { Text } = Typography;
const { Content } = Layout;
const { Search } = Input;

const COLUMN_MIN_WIDTH = 220;
const COLUMN_INITIAL_WIDTH = 350;

const JobPipelineView = memo(({ jobId, setDrawerTitle, pipelineDataType, isGlobalPipeline = false, setIsJobsListDrawerOpen = () => {} }) => {
  const isGlobalView = jobId === null || jobId === "";
  const [searchTerm, setSearchTerm] = useState("");
  const [columnWidth, setColumnWidth] = useState(() => {
    const savedWidth = localStorage.getItem(RECRUITLY__JOB_PIPELINE_BOARD_COLUMN_WIDTH_LS);
    return savedWidth ? parseInt(savedWidth, 10) : COLUMN_INITIAL_WIDTH;
  });
  const { viewMode, setViewMode } = useViewModeStore();
  const { selectedItems, filters, setFilters, clearFilters } = useJobPipelineStore();
  const [job, setJob] = useState(null);
  const [userList, setUserList] = useState(null);

  const {
    data: { filteredData = [], unfilteredData = [], boardData = {}, boardCounts = {}, filteredBoardCounts = {} } = {},
    isLoading,
    isFetching,
    refetch,
  } = useFetchPipelineData({ jobId, filters, pipelineDataType });

  const { data: columns } = useFetchColumnNames({ enabled: viewMode === VIEW_MODES.kanban });

  const { highlightedColumn, registerColumnRef, handleScrollToColumn } = useScrollToColumn({ columns });

  useEffect(() => {
    if (jobId) {
      fetchJobData(jobId).then((respJson) => {
        if (respJson && respJson.data) {
          const jobObj = respJson.data;
          setJob(jobObj);
        }
      });
    }
  }, [jobId]);

  useEffect(() => {
    if (job) {
      if (setDrawerTitle) {
        setDrawerTitle(jobTitleComponent(job));
      }
    }
  }, [job]);

  const jobTitleComponent = (job) => {
    return (
      <Flex gap={"small"} justify={"start"}>
        <Text>
          <Text type="secondary">{job.reference}</Text> {job.title}
        </Text>
        <Text>
          <BiBuilding /> {job.company.name}
        </Text>
        <Text>
          <BiUser /> {job.contact.firstName} {job.contact.surname}
        </Text>
      </Flex>
    );
  };

  const renderSearchPlaceholder = () => {
    if (isLoading) return "";
    return unfilteredData?.length === filteredData?.length ? `Search in ${unfilteredData?.length} records` : `Search in ${filteredData?.length} of ${unfilteredData?.length} records`;
  };

  const userTreeData = useMemo(() => {
    const allUsers = userList;
    if (!allUsers?.length || !unfilteredData) return;
    return buildUserTree(allUsers, unfilteredData, filters.userTypeFilter);
  }, [userList, unfilteredData, filters.userTypeFilter]);

  const statusTreeData = useMemo(() => {
    if (!unfilteredData) return;
    return buildStatusTree(unfilteredData, columns);
  }, [unfilteredData, columns]);

  const rejectReasonsTreeData = useMemo(() => {
    if (!unfilteredData) return;
    return buildRejectReasonTree(unfilteredData);
  }, [unfilteredData]);

  useEdgeEvents({ jobId });

  const isFiltering = Object.entries(filters).some(([key, value]) => {
    if (key === JOB_PIPELINE_FILTERS.userTypeFilter) {
      return false;
    }

    if (key === JOB_PIPELINE_FILTERS.stateFilter) {
      return value !== STATE_FILTER_TYPES.active;
    }

    if (key === JOB_PIPELINE_FILTERS.dateFilter) {
      return value.type && value.type.length !== 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== "" && value !== false;
  });

  const id = jobId || pipelineDataType || PIPELINE_DATA_TYPE.all_my_open_jobs;

  const hasSelectedItems = selectedItems[id]?.length > 0;

  const rejectedCandidatesCount = unfilteredData.filter(({ rejected }) => !!rejected).length;
  const activeCandidatesCount = unfilteredData.length - rejectedCandidatesCount;

  const renderGlobalPipelineBtnLabel = () => {
    if (job && job?.id) {
      return (
        <Tooltip title={job.title} overlayStyle={{ fontSize: 12 }}>
          <Text style={{ maxWidth: 200, color: "white" }} ellipsis={true} type={"secondary"}>
            <span>{job.reference}</span> <span>{job.title}</span>
          </Text>
        </Tooltip>
      );
    }

    if (pipelineDataType === PIPELINE_DATA_TYPE.all_my_open_jobs) {
      return "My Jobs";
    }

    return "All Jobs";
  };

  const [buttonLabel, setButtonLabel] = useState(renderGlobalPipelineBtnLabel());

  useEffect(() => {
    setButtonLabel(renderGlobalPipelineBtnLabel());

    if (!jobId) {
      setJob(null);
    }

    fetchUserList().then((respJson) => {
      if (respJson && respJson.data) {
        setUserList(respJson.data);
      }
    });
  }, [pipelineDataType, job]);

  return (
    <Layout>
      <Flex gap={"small"} justify="space-between" align={"center"} style={{ background: "transparent" }}>
        <Flex gap="small" align="center">
          {isGlobalPipeline ? (
            <Button icon={<FunnelSimple size={20} />} size={"small"} type="primary" style={{ paddingLeft: 5, paddingRight: 5 }} onClick={() => setIsJobsListDrawerOpen((isOpen) => !isOpen)}>
              {buttonLabel}
            </Button>
          ) : (
            <Segmented
              size="middle"
              options={[
                {
                  value: VIEW_MODES.kanban,
                  icon: (
                    <Tooltip zIndex={999999999} title="Kanban view" overlayStyle={{ fontSize: "12px" }}>
                      <BsFillKanbanFill />{" "}
                    </Tooltip>
                  ),
                },
                {
                  value: VIEW_MODES.table,
                  icon: (
                    <Tooltip zIndex={999999999} title="List view" overlayStyle={{ fontSize: "12px" }}>
                      <BsTable />
                    </Tooltip>
                  ),
                },
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          )}

          <JobPipelineBulkActionsMenu />
          <Flex
            style={{
              display: hasSelectedItems ? "none" : "flex",
              width: "100%",
            }}
            gap="small"
            align="center"
          >
            <Search
              placeholder={renderSearchPlaceholder()}
              value={searchTerm}
              onChange={({ target }) => setSearchTerm(target.value)}
              onSearch={(value) => setFilters(JOB_PIPELINE_FILTERS.searchValue, value)}
              style={{ width: "250px" }}
              allowClear
            />
          </Flex>
        </Flex>
        <div
          style={{
            display: hasSelectedItems ? "none" : "flex",
            alignItems: "center",
            width: "100%",
            flexDirection: "row",
            gap: "0.5rem",
          }}
        >
          {unfilteredData.length > 0 && (
            <>
              <FilterDropdown
                cascadeTreeData={USER_FILTER_TYPE_SELECTOR}
                treeData={userTreeData}
                value={filters.usersFilter}
                cascaderValue={filters.userTypeFilter}
                onCascaderSelect={(value) => {
                  if (!value.length) {
                    setFilters(JOB_PIPELINE_FILTERS.userTypeFilter, [USER_FILTER_TYPES.ALL]);
                    return;
                  }
                  setFilters(JOB_PIPELINE_FILTERS.userTypeFilter, value);
                }}
                onSelect={(value) => setFilters(JOB_PIPELINE_FILTERS.usersFilter, value)}
                icon={AiOutlineUser}
                label="Users"
                isCascadeSelector
              />
              <FilterDropdown treeData={statusTreeData} value={filters.statusFilter} onSelect={(value) => setFilters(JOB_PIPELINE_FILTERS.statusFilter, value)} icon={IoShareSocial} label="Status" />

              {[STATE_FILTER_TYPES.all, STATE_FILTER_TYPES.rejected].includes(filters.stateFilter) && rejectedCandidatesCount > 0 && (
                <FilterDropdown
                  treeData={rejectReasonsTreeData}
                  value={filters.rejectReasonsFilter}
                  onSelect={(value) => setFilters(JOB_PIPELINE_FILTERS.rejectReasonsFilter, value)}
                  icon={PiUserMinus}
                  label="Reject reasons"
                />
              )}

              <DateFilter />
            </>
          )}
          {isFiltering && (
            <Button
              color="default"
              variant="text"
              style={{ height: "30px" }}
              icon={<IoMdClose size={18} />}
              onClick={() => {
                clearFilters();
                setSearchTerm("");
              }}
            >
              Clear
            </Button>
          )}
          {viewMode === VIEW_MODES.kanban && (
            <>
              <Flex gap="4px 0" wrap style={{ cursor: "pointer" }}>
                <Space.Compact>
                  {columns
                    ?.filter(({ id }) => filteredBoardCounts[id] > 0)
                    .map(({ name, id }) => (
                      <Tooltip overlayStyle={{ fontSize: 12 }} title={name} key={id}>
                        <Button size="small" style={{ padding: 4 }} onClick={() => handleScrollToColumn(id)}>
                          <Badge color="#D3D3D3" count={filteredBoardCounts[id] || 0} style={{ color: "#000", cursor: "pointer" }} showZero overflowCount={9999} />
                        </Button>
                      </Tooltip>
                    ))}
                </Space.Compact>
              </Flex>
              <div style={{ width: "100px" }}>
                <Slider
                  min={COLUMN_MIN_WIDTH}
                  max={500}
                  onChange={setColumnWidth}
                  value={typeof columnWidth === "number" ? columnWidth : 0}
                  tooltip={{ formatter: (value) => `Column Width: ${value}` }}
                />
              </div>
            </>
          )}
        </div>
        <Flex>
          <Dropdown
            menu={{
              selectedKeys: [filters.stateFilter],
              onSelect: ({ key }) => setFilters(JOB_PIPELINE_FILTERS.stateFilter, key),
              selectable: true,
              items: stateSwitcherItems({
                activeCandidatesCount,
                rejectedCandidatesCount,
                unfilteredDataCount: unfilteredData.length,
              }),
            }}
          >
            <Button type="secondary" icon={<EyeOutlined size={"18"} />} style={{ marginLeft: "auto", cursor: "pointer" }} />
          </Dropdown>
          {getActiopnsMenuItems(viewMode, refetch).map(({ key, icon, onClick }) => (
            <Button
              key={key}
              type="secondary"
              icon={icon}
              iconPosition="end"
              onClick={(e) => {
                e.preventDefault();
                onClick();
              }}
            />
          ))}
        </Flex>
      </Flex>
      <Content>
        {viewMode === VIEW_MODES.table ? (
          <JobPipelineTableView data={filteredData} loading={isLoading || isFetching} isGlobalView={isGlobalView} />
        ) : (
          <JobPipelineBoardView
            {...{
              isFetching,
              highlightedColumn,
              columns,
              boardCounts,
              columnWidth,
              registerColumnRef,
              isGlobalView,
            }}
            data={boardData}
            loading={isLoading}
          />
        )}
      </Content>
    </Layout>
  );
});

export default JobPipelineView;
