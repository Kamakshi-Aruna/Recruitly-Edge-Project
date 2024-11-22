import { useQuery } from "react-query";

import { fetchUserList } from "@api/user.js";
import queryKeys from "@constants/queryKeys.js";

export const useFetchUserList = () =>
  useQuery([queryKeys.users.list], fetchUserList, {
    select: ({ data }) => data.sort((a, b) => a.firstName - b.firstName),
  });
