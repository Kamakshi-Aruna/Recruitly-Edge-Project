import { filterByUsers } from "../utils";

export const buildStatusTree = (data, columns) => {
  if (!columns || !data) return;
  const statusGroups = data.reduce((acc, { statusCode, statusName, stateName, stateId }) => {
    if (statusCode && statusName && stateName && stateId) {
      if (!acc[statusCode]) {
        acc[statusCode] = { statusName, states: {} };
      }
      acc[statusCode].states[stateId] = {
        stateName,
        count: (acc[statusCode].states[stateId]?.count || 0) + 1,
      };
    }

    return acc;
  }, {});
  const orderedStatusGroups = Object.fromEntries(columns?.map(({ id }) => [id, statusGroups[id]]).filter((groups) => groups?.[1] !== undefined));
  const treeData = Object.entries(orderedStatusGroups)
    .map(([statusCode, { statusName, states }]) => {
      const stateNamesArray = Object.entries(states).map(([stateId, { stateName, count }]) => ({
        title: `${stateName} (${count})`,
        key: `${statusCode}-${stateId}`,
      }));
      if (stateNamesArray.length > 0) {
        const totalCount = Object.values(states).reduce((sum, { count }) => sum + count, 0);

        return {
          title: `${statusName} (${totalCount})`,
          key: statusCode,
          children: stateNamesArray,
        };
      }

      return null;
    })
    .filter(Boolean);

  return treeData;
};
export const buildUserTree = (data, unfilteredData, userTypeFilter) => {
  const userGroups = data.reduce((acc, { teamName, id, fullName }) => {
    const filteredUsers = filterByUsers(unfilteredData, [`${teamName}-${id}`], userTypeFilter);
    const userCount = filteredUsers.length;
    if (!acc[teamName] && userCount > 0) {
      acc[teamName] = { users: new Map(), count: 0 };
    }

    if (userCount > 0) {
      acc[teamName].users.set(id, { fullName, count: userCount });
      acc[teamName].count += userCount;
    }
    return acc;
  }, {});

  return Object.entries(userGroups).map(([teamName, { users }]) => {
    const userNamesArray = Array.from(users.entries()).map(([userId, { fullName, count }]) => ({
      title: `${fullName} (${count})`,
      key: `${teamName}-${userId}`,
    }));

    return {
      title: teamName,
      key: teamName,
      children: userNamesArray,
    };
  });
};

export const USER_FILTER_TYPES = {
  ALL: "ALL",
  PIPELINE_OWNER: "PIPELINE_OWNER",
  CANDIDATE_OWNER: "CANDIDATE_OWNER",
  JOB_OWNER: "JOB_OWNER",
};

export const USER_FILTER_TYPE_SELECTOR = [
  {
    title: "All",
    key: USER_FILTER_TYPES.ALL,
    children: [
      {
        title: "Pipeline owner",
        key: USER_FILTER_TYPES.PIPELINE_OWNER,
      },
      {
        title: "Candidate owner",
        key: USER_FILTER_TYPES.CANDIDATE_OWNER,
      },
      {
        title: "Job owner",
        key: USER_FILTER_TYPES.JOB_OWNER,
      },
    ],
  },
];

export const buildRejectReasonTree = (data) => {
  const rejectReasonGroups = data.reduce((acc, { statusName, reasonName, reasonId }) => {
    if (!acc[statusName]) {
      acc[statusName] = {};
    }
    if (reasonName) {
      if (!acc[statusName][reasonId]) {
        acc[statusName][reasonId] = { reasonName, count: 0 };
      }
      acc[statusName][reasonId].count += 1;
    }
    return acc;
  }, {});

  const treeData = Object.entries(rejectReasonGroups)
    .map(([statusName, reasonCounts]) => {
      const reasonNamesArray = Object.entries(reasonCounts).map(([reasonId, { reasonName, count }]) => ({
        title: `${reasonName} (${count})`,
        key: `${statusName}-${reasonId}`,
      }));

      if (reasonNamesArray.length > 0) {
        const totalCount = Object.values(reasonCounts).reduce((sum, { count }) => sum + count, 0);

        return {
          title: `${statusName} (${totalCount})`,
          key: statusName,
          children: reasonNamesArray,
        };
      }

      return null;
    })
    .filter(Boolean);

  return treeData;
};
