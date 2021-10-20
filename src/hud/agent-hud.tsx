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
import { BrowserRouter } from "react-router-dom";

import { Route } from "react-router";
import { agentDashboardPath } from "router";
import { PluginCard } from "./plugin-card";
import {
  CoverageSection, RisksSection, TestsSection, TestsToRunSection,
} from "./agent-sections";

export interface AgentHudProps {
  customProps: { pluginPagePath: string; }
}

export const AgentHud = ({ customProps: { pluginPagePath } }: AgentHudProps) => (
  <BrowserRouter>
    <Route path={`*${agentDashboardPath}`}>
      <PluginCard pluginLink={pluginPagePath}>
        <CoverageSection />
        <TestsSection />
        <RisksSection />
        <TestsToRunSection />
      </PluginCard>
    </Route>
  </BrowserRouter>
);
