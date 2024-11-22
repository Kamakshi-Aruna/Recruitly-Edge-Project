import { useEffect } from "react";

import { SORT_ORDERS, SORT_TYPES } from "../constants";
import useColumnSortStore from "../stores/useColumnSortStore";

const getSortField = (item) => ({
  [SORT_TYPES.name]: item.candidate?.name,
  [SORT_TYPES.email]: item.candidate?.email,
  [SORT_TYPES.last_activity]: item.modifiedOn,
  [SORT_TYPES.added_date]: item.createdOn,
  [SORT_TYPES.last_contacted]: item.candidateActivity?.lastContacted,
});

export const sortBoard = (board, sorting, setBoard) => {
  Object.keys(board).forEach((column) => {
    if (!sorting[column]) {
      sorting[column] = { key: SORT_TYPES.last_activity, order: SORT_ORDERS.desc };
    }
  });
  setBoard(board);
  Object.keys(sorting).forEach((id) => {
    if (board[id]) {
      const sortKey = sorting[id]?.key;
      const sortOrder = sorting[id]?.order;

      if (sortKey && board[id] && board[id].length > 0) {
        const sortedBoard = [...board[id]];

        sortedBoard.sort((a, b) => {
          const aValue = getSortField(a)[sortKey];
          const bValue = getSortField(b)[sortKey];

          if (aValue === bValue) return 0;

          if (sortOrder === SORT_ORDERS.desc) {
            return aValue < bValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });

        setBoard((prevBoard) => ({
          ...prevBoard,
          [id]: sortedBoard,
        }));
      }
    }
  });
};

const useSorting = ({ data, board, setBoard }) => {
  const sorting = useColumnSortStore((state) => state.sorting);

  useEffect(() => {
    if (!data || Object.keys(board).length === 0) return;
    sortBoard(data, sorting, setBoard);
  }, [sorting, data, setBoard]);
};

export default useSorting;
