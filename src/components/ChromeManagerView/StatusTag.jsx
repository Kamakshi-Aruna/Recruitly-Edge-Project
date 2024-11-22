import { Tag } from "antd";

const StatusTag = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <Tag style={{ fontSize: 13 }}>
        {label} <strong>{value}</strong>
      </Tag>
    </div>
  );
};

export default StatusTag;
