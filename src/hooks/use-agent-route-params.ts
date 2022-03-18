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
import { matchPath, useLocation } from "react-router-dom";
import {
  agentPluginPath, agentDashboardPath, groupPluginPath, groupDashboardPath,
} from "admin-routes";

interface Params {
  agentId: string;
  pluginId: string;
}

export const useAgentRouteParams = (): Params => {
  const { pathname } = useLocation();
  const { params: { agentId = "", pluginId = "" } = {} } = matchPath<Partial<Params>>(
    pathname,
    { path: [agentPluginPath, agentDashboardPath, groupPluginPath, groupDashboardPath] },
  ) || {};
  return { agentId, pluginId };
};
