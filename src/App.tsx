import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import {
  LockOutlined,
  ProjectOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import routerBindings, {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { OhifViewer } from "./components/ohif-viewer";
import Title from "./components/title";
import { OhifViewerProvider } from "./contexts/ohif-viewer";
import Homepage from "./pages/home";
import { MembersList } from "./pages/members";
import PermissionsList from "./pages/permissions/list";
import { ProjectsCreate, ProjectsList, ProjectsShow } from "./pages/projects";
import { TagsList } from "./pages/tags";
import { accessControlProvider } from "./providers/access-control";
import authProvider from "./providers/auth-provider";
import { dataProvider } from "./providers/supabase";
import { supabaseClient } from "./utils";
import { ThemedLayoutV2 } from "./components/layout";
import { ThemedSiderV2 } from "./components/layout/sider";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider>
          <AntdApp notification={{ duration: 2 }}>
            <OhifViewerProvider>
              <Refine
                accessControlProvider={accessControlProvider()}
                liveProvider={liveProvider(supabaseClient as any)}
                dataProvider={dataProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={useNotificationProvider}
                resources={[
                  {
                    name: "projects",
                    meta: {
                      label: "Projects",
                      icon: <ProjectOutlined />,
                    },
                    list: "/projects",
                    create: "/projects/create",
                    edit: "/projects/edit/:id",
                    show: "/projects/show/:id",
                  },
                  {
                    name: "project_tags",
                    meta: {
                      label: "Tags",
                      icon: <TagsOutlined />,
                    },
                    list: "/tags",
                  },
                  {
                    name: "members",
                    meta: {
                      label: "Members",
                      icon: <TeamOutlined />,
                    },
                    list: "/members",
                  },
                  {
                    name: "permissions",
                    meta: {
                      label: "Permissions",
                      icon: <LockOutlined />,
                    },
                    list: "/permissions",
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: false,
                  useNewQueryKeys: true,
                  projectId: "qbyScv-plNUow-2gBgmC",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <OhifViewer>
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <ThemedLayoutV2
                            Header={Header}
                            Sider={(props) => (
                              <ThemedSiderV2 {...props} fixed />
                            )}
                            Title={Title}
                          >
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      </OhifViewer>
                    }
                  >
                    <Route index element={<Homepage />} />
                    <Route path="/projects">
                      <Route index element={<ProjectsList />} />
                      <Route path="create" element={<ProjectsCreate />} />
                      <Route path="show/:id" element={<ProjectsShow />} />
                      <Route path="show/:id/:tab" element={<ProjectsShow />} />
                      <Route
                        path="edit/:id"
                        element={<ProjectsCreate isEdit />}
                      />
                    </Route>
                    <Route path="/tags" element={<TagsList />} />
                    <Route path="/members" element={<MembersList />} />
                    <Route path="/permissions" element={<PermissionsList />} />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                          formProps={{
                            initialValues: {
                              email: "info@refine.dev",
                              password: "refine-supabase",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/register"
                      element={<AuthPage type="register" />}
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                  </Route>
                </Routes>
                <RefineKbar />
              </Refine>
            </OhifViewerProvider>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
