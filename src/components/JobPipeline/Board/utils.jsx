import SortOptionLabel from "./SortDropdown/SortOptionLabel";
import { SORT_TYPES } from "./constants";

export const getSortOptions = ({ handleSort, order, columnId }) => [
  {
    label: <SortOptionLabel sortKey={SORT_TYPES.name} label="Name" {...{ handleSort, order, columnId }} />,
    key: SORT_TYPES.name,
  },
  {
    label: <SortOptionLabel sortKey={SORT_TYPES.email} label="Email" {...{ handleSort, order, columnId }} />,
    key: SORT_TYPES.email,
  },
  {
    label: <SortOptionLabel sortKey={SORT_TYPES.added_date} label="Added date" {...{ handleSort, order, columnId }} />,
    key: SORT_TYPES.added_date,
  },
  {
    label: <SortOptionLabel sortKey={SORT_TYPES.last_activity} label="Last activity" {...{ handleSort, order, columnId }} />,
    key: SORT_TYPES.last_activity,
  },
  {
    label: <SortOptionLabel sortKey={SORT_TYPES.last_contacted} label="Last contacted" {...{ handleSort, order, columnId }} />,
    key: SORT_TYPES.last_contacted,
  },
];
