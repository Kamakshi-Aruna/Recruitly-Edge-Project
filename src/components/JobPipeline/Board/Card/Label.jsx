import { Tag, Tooltip, Typography } from "antd";

const { Text } = Typography;

const Label = ({ label, tooltipLabel, style, onClick, stateFontColor, stateColor }) => {
  return (
    <Tooltip zIndex={999999999} title={tooltipLabel} overlayStyle={{ fontSize: "12px" }}>
      <Tag color={stateColor} onClick={onClick} style={style}>
        <Text style={{ fontSize: 12, color: stateFontColor }}>{label}</Text>
      </Tag>
    </Tooltip>
  );
};

export default Label;
