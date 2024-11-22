import { useMutation, useQuery, useQueryClient } from "react-query";

import { deleteImport, fetchApolloData } from "@api/chromeManager";
import { IMPORT_TYPES } from "@components/ChromeManagerView/constants";
import queryKeys from "@constants/queryKeys";

export const useFetchPeopleRequests = () => useQuery([queryKeys.chromeManager.peopleImports], () => fetchApolloData("people_import"), { select: ({ data }) => data });

export const useFetchCompanyRequests = () => useQuery([queryKeys.chromeManager.companyImports], () => fetchApolloData("company_import"), { select: ({ data }) => data });

export const useFetchAnalytics = () => useQuery([queryKeys.chromeManager.analytics], () => fetchApolloData("import_analytics"), { select: ({ data }) => data });

export const useDeleteImport = () => {
  const queryClient = useQueryClient();

  return useMutation(({ requestId, type }) => deleteImport(requestId, type), {
    onSuccess: (_, { type }) => {
      if (type === IMPORT_TYPES.people_import) {
        queryClient.invalidateQueries(queryKeys.chromeManager.peopleImports);
      }
      if (type === IMPORT_TYPES.company_import) {
        queryClient.invalidateQueries(queryKeys.chromeManager.companyImports);
      }
    },
  });
};
