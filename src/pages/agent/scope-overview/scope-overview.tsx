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
import {
  Redirect, useParams,
} from "react-router-dom";
import { Icons } from "@drill4j/ui-kit";
import "twin.macro";

import {
  TabsPanel, Tab,
} from "components";
import { ActiveScope } from "types/active-scope";
import { useActiveScope, useAgent, useBuildVersion } from "hooks";
import { Route } from "react-router";
import { getPagePath, routes } from "common";
import { getAgentRoutePath } from "router";
import { ScopeOverviewHeader } from "./scope-overview-header";
import { ScopeMethodsInfo } from "./scope-methods-info";
import { ScopeTestsInfo } from "./scope-tests-info";

export const ScopeOverview = () => {
  const {
    pluginId = "", scopeId = "", buildVersion = "", tab = "", agentId = "",
  } = useParams<{ pluginId: string, scopeId: string, buildVersion: string; tab: string; agentId?: string; }>();
  const { buildVersion: activeBuildVersion = "", status } = useAgent(agentId) || {};
  const scope = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`);

  const newBuildHasAppeared = activeBuildVersion && buildVersion && activeBuildVersion !== buildVersion;
  const activeScope = useActiveScope();
  const hasNewActiveScope = activeScope && activeScope?.id !== scopeId;

  return (
    (scope && !scope?.coverage.percentage && newBuildHasAppeared) || (hasNewActiveScope && scope && !scope?.coverage?.percentage)
      ? <Redirect to={{ pathname: getPagePath({ name: "methods" }) }} />
      : (
        <div tw="px-6">
          <ScopeOverviewHeader status={status} isActiveBuild={activeBuildVersion === buildVersion} />
          <div tw="flex flex-col items-center w-full border-b border-monochrome-medium-tint">
            <div tw="mb-4 w-full border-b border-monochrome-medium-tint">
              <TabsPanel path={getAgentRoutePath("/scopes/:scopeId/:tab")}>
                <Tab name="methods" to={getPagePath({ name: "scopeMethods", params: { scopeId } })}>
                  <div tw="flex items-center mr-2 text-monochrome-black">
                    <Icons.Function />
                  </div>
                  Scope methods
                </Tab>
                <Tab name="tests" to={getPagePath({ name: "scopeTests", params: { scopeId } })}>
                  <div tw="flex items-center mr-2 text-monochrome-black">
                    <Icons.Test width={16} />
                  </div>
                  Scope tests
                </Tab>
              </TabsPanel>
            </div>
            <div tw="w-full">
              <Route path={getAgentRoutePath(routes.scopeMethods)} component={ScopeMethodsInfo} />
              <Route path={getAgentRoutePath(routes.scopeTests)} component={ScopeTestsInfo} />
            </div>
          </div>
        </div>
      )
  );
};
