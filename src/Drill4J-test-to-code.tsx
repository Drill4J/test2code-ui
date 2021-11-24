/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import { BrowserRouter, Route } from "@drill4j/ui-kit";
import axios from "axios";

import { Agent, Group } from "pages";
import { SwitchBuildContext } from "contexts";

import { AgentHud as Test2CodeAgentHUD, GroupHudProps, ServiceGroupHud as Test2CodeServiceGroupHUD } from "./hud";
import { GroupRootComponentProps } from "./pages/group/group";
import { agentDashboardPath, groupDashboardPath } from "./router";
import { routes } from "./common";
import pkj from "../package.json";

import "./index.css";

console.log("Test2Code-UI version: ", pkj.version);

axios.defaults.baseURL = process.env.REACT_APP_API_HOST
  ? `http://${process.env.REACT_APP_API_HOST}/api`
  : "/api";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const ErrorBoundary = (err: Error, info: React.ErrorInfo, props: any) => (
  <ul>
    <li>err: {err}</li>
    <li>info: {info}</li>
    <li>props: {props}</li>
  </ul>
);

interface AgentRootComponentProps {
  switchBuild: (version: string, path: string) => void
}

const AgentPluginLifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ({ switchBuild }: AgentRootComponentProps) => (
    <BrowserRouter>
      <SwitchBuildContext.Provider value={switchBuild}>
        <Agent />
      </SwitchBuildContext.Provider>
    </BrowserRouter>
  ),
  domElementGetter: () => document.getElementById("test2code") || document.body,
  errorBoundary: ErrorBoundary,
});

export const AgentPlugin = {
  mount: [
    AgentPluginLifecycle.mount,
  ],
  unmount: [
    AgentPluginLifecycle.unmount,
  ],
  update: AgentPluginLifecycle.update,
  bootstrap: AgentPluginLifecycle.bootstrap,
};

export const AgentHUDLifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: (props) => (
    <BrowserRouter>
      <Route path={agentDashboardPath}>
        <Test2CodeAgentHUD {...props} />
      </Route>
    </BrowserRouter>
  ),
  errorBoundary: ErrorBoundary,
});

export const AgentHUD = {
  mount: [
    AgentHUDLifecycle.mount,
  ],
  unmount: [
    AgentHUDLifecycle.unmount,
  ],
  update: AgentHUDLifecycle.update,
  bootstrap: AgentHUDLifecycle.bootstrap,
};

const GroupHUDLifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: (props: GroupHudProps) => (
    <BrowserRouter>
      <Route path={groupDashboardPath}>
        <Test2CodeServiceGroupHUD {...props} />
      </Route>
    </BrowserRouter>
  ),
  errorBoundary: ErrorBoundary,
});

export const GroupHUD = {
  mount: [
    GroupHUDLifecycle.mount,
  ],
  unmount: [
    GroupHUDLifecycle.unmount,
  ],
  update: GroupHUDLifecycle.update,
  bootstrap: GroupHUDLifecycle.bootstrap,
};

export const GroupPluginLifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: (props: GroupRootComponentProps) => (
    <BrowserRouter>
      <Group {...props} />
    </BrowserRouter>
  ),
  domElementGetter: () => document.getElementById("test2code") || document.body,
  errorBoundary: ErrorBoundary,
});

export const GroupPlugin = {
  mount: [
    GroupPluginLifecycle.mount,
  ],
  unmount: [
    GroupPluginLifecycle.unmount,
  ],
  update: GroupPluginLifecycle.update,
  bootstrap: GroupPluginLifecycle.bootstrap,
};

export const Routes = { ...routes };
