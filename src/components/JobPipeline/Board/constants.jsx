import { FaSortDown, FaSortUp } from "react-icons/fa";

export const SORT_ORDERS = {
  asc: "ASC",
  desc: "DESC",
};

export const SORT_TYPES = {
  name: "NAME",
  email: "EMAIL",
  added_date: "ADDED_DATE",
  last_activity: "LAST_ACTIVITY",
  last_contacted: "LAST_CONTACTED",
};

export const SORT_ORDER_OPTIONS = [
  {
    value: SORT_ORDERS.asc,
    label: <FaSortUp />,
  },
  {
    value: SORT_ORDERS.desc,
    label: <FaSortDown />,
  },
];
