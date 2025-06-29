import { generateFilter, handleError } from "../utils";
import type { DataProvider } from "@refinedev/core";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Map resource names to their corresponding RPC function names.
 * Add more mappings as needed.
 */

export const dataProvider = (
  supabaseClient: SupabaseClient<any, string, any>
): Required<DataProvider> => {
  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;
      const query = supabaseClient.from(tableName).select(meta?.select ?? "*", {
        count: meta?.count ?? "exact",
      });

      if (mode === "server") {
        query.range((current - 1) * pageSize, current * pageSize - 1);
      }

      sorters?.map((item) => {
        const [foreignTable, field] = item.field.split(/\.(?=[^.]+$)/);

        if (foreignTable && field) {
          query
            .select(meta?.select ?? `*, ${foreignTable}(${field})`)
            .order(field, {
              ascending: item.order === "asc",
              foreignTable: foreignTable,
            });
        } else {
          query.order(item.field, {
            ascending: item.order === "asc",
          });
        }
      });

      filters?.map((item) => {
        generateFilter(item, query);
      });

      const { data, count, error } = await query;

      if (error) {
        return handleError(error);
      }

      return {
        data: data || [],
        total: count || 0,
      } as any;
    },

    getMany: async ({ resource, ids, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;
      const query = supabaseClient.from(tableName).select(meta?.select ?? "*");

      if (meta?.idColumnName) {
        // @ts-ignore
        query.in(meta.idColumnName, ids);
      } else {
        query.in("id", ids);
      }

      const { data, error } = await query;

      if (error) {
        return handleError(error);
      }

      return {
        data: data || [],
      } as any;
    },

    create: async ({ resource, variables, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;

      const rpcFn = `${resource}_create`;
      const { data, error } = await supabaseClient.rpc(rpcFn, variables);
      if (error) {
        return handleError(error);
      }
      return {
        data: Array.isArray(data) ? data[0] : data,
      };
    },

    createMany: async ({ resource, variables, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;
      const query = supabaseClient.from(tableName).insert(variables);

      query.select(meta?.select ?? "*");

      const { data, error } = await query;

      if (error) {
        return handleError(error);
      }

      return {
        data: data as any,
      };
    },

    update: async ({ resource, id, variables, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;

      const rpcFn = `${resource}_update`;
      const { data, error } = await supabaseClient.rpc(rpcFn, {
        id,
        ...variables,
      });
      if (error) {
        return handleError(error);
      }
      return {
        data: Array.isArray(data) ? data[0] : data,
      };
    },

    updateMany: async ({ resource, ids, variables, meta }) => {
      const response = await Promise.all(
        ids.map(async (id) => {
          const tableName = meta?.schema
            ? `${meta.schema}.${resource}`
            : resource;
          const query = supabaseClient.from(tableName).update(variables);

          if (meta?.idColumnName) {
            query.eq(meta.idColumnName, id);
          } else {
            query.match({ id });
          }

          query.select(meta?.select ?? "*");

          const { data, error } = await query;
          if (error) {
            return handleError(error);
          }

          return (data || [])[0] as any;
        })
      );

      return {
        data: response,
      };
    },

    getOne: async ({ resource, id, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;
      const query = supabaseClient.from(tableName).select(meta?.select ?? "*");

      if (meta?.idColumnName) {
        query.eq(meta.idColumnName, id);
      } else {
        query.match({ id });
      }

      const { data, error } = await query;
      if (error) {
        return handleError(error);
      }

      return {
        data: (data || [])[0] as any,
      };
    },

    deleteOne: async ({ resource, id, meta }) => {
      const tableName = meta?.schema ? `${meta.schema}.${resource}` : resource;

      const rpcFn = `${resource}_delete`;
      const { data, error } = await supabaseClient.rpc(rpcFn, { id });
      if (error) {
        return handleError(error);
      }
      return {
        data: Array.isArray(data) ? data[0] : data,
      };
    },

    deleteMany: async ({ resource, ids, meta }) => {
      const response = await Promise.all(
        ids.map(async (id) => {
          const tableName = meta?.schema
            ? `${meta.schema}.${resource}`
            : resource;
          const query = supabaseClient.from(tableName).delete();

          if (meta?.idColumnName) {
            query.eq(meta.idColumnName, id);
          } else {
            query.match({ id });
          }

          const { data, error } = await query;
          if (error) {
            return handleError(error);
          }

          return (data || [])[0] as any;
        })
      );

      return {
        data: response,
      };
    },

    getApiUrl: () => {
      throw Error("Not implemented on refine-supabase data provider.");
    },

    custom: async ({ url, payload }) => {
      const { data, error } = await supabaseClient.rpc(url, payload);
      if (error) return handleError(error);
      return { data };
    },
  };
};
