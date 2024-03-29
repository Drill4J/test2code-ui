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
import { BrowserRouter, Route } from "react-router-dom";
import axios from "axios";

import { Agent, Group } from "pages";

import { agentDashboardPath, groupDashboardPath } from "admin-routes";
import { SetPanelContext, FilterContextProvider } from "common";
import { AgentHud as Test2CodeAgentHUD, GroupHudProps, ServiceGroupHud as Test2CodeServiceGroupHUD } from "./hud";
import pkj from "../package.json";

import "./index.css";
import { ResultFilterContextProvider } from "./common/contexts/result-filter-context";

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

const AgentPluginLifecycle = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ({ setPanel }) => (
    <BrowserRouter>
      <FilterContextProvider>
        <ResultFilterContextProvider>
          <SetPanelContext.Provider value={setPanel}>
            <Agent />
          </SetPanelContext.Provider>
        </ResultFilterContextProvider>
      </FilterContextProvider>
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
  rootComponent: ({ setPanel, ...props }) => (
    <BrowserRouter>
      <SetPanelContext.Provider value={setPanel}>
        <Group {...props} />
      </SetPanelContext.Provider>
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
