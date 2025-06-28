import { IAccessControlContext } from "@refinedev/core";
import { supabaseClient } from "../utils";
import authProvider from "./auth-provider";

export const accessControlProvider = (): Required<IAccessControlContext> => {
  return {
    can: async ({ resource, action }) => {
      // Try to get permissions from local storage
      const cachedPermissions = localStorage.getItem("resource_access");
      let permissions;

      if (cachedPermissions) {
        // If permissions are in local storage, parse them
        permissions = JSON.parse(cachedPermissions);
      } else {
        const { authenticated } = await authProvider.check();
        if (!authenticated) return { can: false };

        // If not in local storage, fetch them from Supabase
        // Get current user ID
        const user = authProvider.getIdentity ? await authProvider.getIdentity() : null;
        const userId = (user && typeof user === "object" && "id" in user) ? (user as { id: string }).id : null;
        if (!userId) return { can: false };

        // Fetch permissions from the resource_access view for this user
        const { data } = await supabaseClient
          .from("resource_access")
          .select("resource, action");
        permissions = data ?? [];

        // Store the permissions in local storage
        localStorage.setItem("resource_access", JSON.stringify(permissions));
      }

      return {
        can: permissions.some(
          (permission: any) =>
            permission.action == action && permission.resource == resource
        ),
      };
    },
    options: {
      buttons: {
        hideIfUnauthorized: true,
      },
    },
  };
};
