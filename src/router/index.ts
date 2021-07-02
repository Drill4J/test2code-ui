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

export const agentPluginPath = "/agents/:agentId/builds/:buildVersion/dashboard/:pluginId";
export const groupPluginPath = "/agents/group/:groupId/dashboard/:pluginId";
export const agentDashboardPath = "/agents/:agentId/builds/:buildVersion/dashboard";
export const groupDashboardPath = "/agents/group/:groupId/dashboard";

export const getAgentRoutePath = (path: string) => (path.startsWith("/")
  ? `${agentPluginPath}${path}`
  : `${agentPluginPath}/${path}`);

export const getGroupRoutePath = (path: string) => (path.startsWith("/")
  ? `${groupPluginPath}${path}`
  : `${groupPluginPath}/${path}`);
