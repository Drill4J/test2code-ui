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
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { Icons, Tab } from "@drill4j/ui-kit";
import "twin.macro";

import { ActiveScope } from "types/active-scope";
import {
  useActiveScope, useAgent, useTestToCodeParams, useAgentParams, useBuildVersion,
} from "hooks";
import { getPagePath } from "common";
import { ScopeOverviewHeader } from "./scope-overview-header";
import { ScopeMethodsInfo } from "./scope-methods-info";
import { ScopeTestsInfo } from "./scope-tests-info";

export const ScopeOverview = () => {
  const [activeTab, setActiveTab] = useState("methods");
  const { agentId } = useAgentParams();
  const { scopeId, buildVersion } = useTestToCodeParams();
  const { buildVersion: activeBuildVersion = "", status } = useAgent(agentId) || {};
  const scope = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`);

  const newBuildHasAppeared = activeBuildVersion && buildVersion && activeBuildVersion !== buildVersion;
  const activeScope = useActiveScope();
  const hasNewActiveScope = activeScope && activeScope?.id !== scopeId;

  return (
    (scope && !scope?.coverage.percentage && newBuildHasAppeared) || (hasNewActiveScope && scope && !scope?.coverage?.percentage)
      ? <Redirect to={{ pathname: getPagePath({ name: "overview", params: { buildVersion } }) }} />
      : (
        <>
          <ScopeOverviewHeader status={status} isActiveBuild={activeBuildVersion === buildVersion} />
          <div tw="flex flex-col items-center w-full">
            <div tw="flex mb-4 w-full border-b border-monochrome-medium-tint">
              <Tab active={activeTab === "methods"} onClick={() => setActiveTab("methods")}>
                <div tw="flex items-center mr-2 text-monochrome-black">
                  <Icons.Function />
                </div>
                Scope methods
              </Tab>
              <Tab active={activeTab === "tests"} onClick={() => setActiveTab("tests")}>
                <div tw="flex items-center mr-2 text-monochrome-black">
                  <Icons.Test width={16} />
                </div>
                Scope tests
              </Tab>
            </div>
            <div tw="w-full">
              {activeTab === "methods" ? <ScopeMethodsInfo /> : <ScopeTestsInfo />}
            </div>
          </div>
        </>
      )
  );
};
