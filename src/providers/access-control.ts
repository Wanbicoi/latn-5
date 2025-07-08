import { IAccessControlContext } from "@refinedev/core";
import { supabaseClient } from "../utils";
import authProvider from "./auth-provider";

export const accessControlProvider = (): Required<IAccessControlContext> => {
  return {
    can: async ({ resource, action }) => {
      const { authenticated } = await authProvider.check();
      if (!authenticated) return { can: false };

      const { data } = await supabaseClient
        .from("resource_access")
        .select("resource, action")
        .eq("resource", resource)
        .eq("action", action)
        .single();

      return {
        can: !!data,
      };
    },
    options: {
      queryOptions: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
      },
      buttons: {
        hideIfUnauthorized: false,
      },
    },
  };
};
