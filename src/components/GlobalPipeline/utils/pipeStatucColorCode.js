export const getPipelineColorByStatus = (status) => {
  const statusMap = {
    SOURCED: "#8e8e8e",
    APPLIED: "#1890ff",
    SHORTLIST: "#52c41a",
    CV_SENT: "#faad14",
    INTERVIEW: "#fa8c16",
    OFFER: "#13c2c2",
    PLACED: "#52c41a",
  };

  return statusMap[status];
};
