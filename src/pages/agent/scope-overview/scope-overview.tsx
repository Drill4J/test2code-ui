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
import { Icons, Tab, useQueryParams } from "@drill4j/ui-kit";
import { useHistory, Redirect } from "react-router-dom";
import "twin.macro";

import { ActiveScope } from "types/active-scope";
import {
  useActiveBuild, useActiveScope, useAgentRouteParams, useFilteredData, useNavigation, useTestToCodeRouteParams,
} from "hooks";
import { ScopeOverviewHeader } from "./scope-overview-header";
import { ScopeMethodsInfo } from "./scope-methods-info";
import { ScopeTestsInfo } from "./scope-tests-info";

export const ScopeOverview = () => {
  const { activeTab } = useQueryParams<{activeTab?: string; }>();
  const { push } = useHistory();
  const { getPagePath } = useNavigation();
  const { scopeId, buildVersion } = useTestToCodeRouteParams();
  const { agentId } = useAgentRouteParams();
  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const scope = useFilteredData<ActiveScope>(`/build/scopes/${scopeId}`);

  const newBuildHasAppeared = activeBuildVersion && buildVersion && activeBuildVersion !== buildVersion;
  const activeScope = useActiveScope();
  const hasNewActiveScope = activeScope && activeScope?.id !== scopeId;

  return (
    (scope && !scope?.coverage.percentage && newBuildHasAppeared) || (hasNewActiveScope && scope && !scope?.coverage?.percentage)
      ? <Redirect to={{ pathname: getPagePath({ name: "overview", params: { buildVersion }, queryParams: { activeTab: "methods" } }) }} />
      : (
        <>
          <ScopeOverviewHeader status={buildStatus} isActiveBuild={activeBuildVersion === buildVersion} />
          <div tw="flex flex-col items-center flex-grow w-full px-6 mt-6">
            <div tw="flex gap-x-6 mb-4 w-full border-b border-monochrome-medium-tint">
              <Tab
                active={activeTab === "methods"}
                onClick={() => push(getPagePath({
                  name: "scope",
                  params: { scopeId, buildVersion },
                  queryParams: { activeTab: "methods" },
                }))}
              >
                <div tw="flex items-center mr-2">
                  <Icons.Function />
                </div>
                Scope methods
              </Tab>
              <Tab
                active={activeTab === "tests"}
                onClick={() => push(getPagePath({
                  name: "scope",
                  params: { scopeId, buildVersion },
                  queryParams: { activeTab: "tests" },
                }))}
              >
                <div tw="flex items-center mr-2">
                  <Icons.Test width={16} />
                </div>
                Scope tests
              </Tab>
            </div>
            <div tw="flex flex-col flex-grow w-full">
              {activeTab === "methods" ? <ScopeMethodsInfo /> : <ScopeTestsInfo />}
            </div>
          </div>
        </>
      )
  );
};
