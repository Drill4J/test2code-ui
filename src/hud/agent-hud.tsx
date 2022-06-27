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
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { BuildVersion } from "@drill4j/types-admin/index";
import { Autocomplete, addQueryParamsToPath, useQueryParams } from "@drill4j/ui-kit";
import {
  CoverageSection, RisksSection,
} from "./agent-sections";
import {
  useActiveBuild, useAgentRouteParams, useFilteredData, useAdminConnection,
} from "../hooks";
import { BuildCoverage, BuildSummary } from "../types";
import { TestType } from "./agent-sections/section-tooltip";
import { getTestsAndTests2RunSections } from "./get-tests-and-tests-2-run-sections";
import { PluginCard } from "./plugin-card";
import "twin.macro";
import { PLUGIN_ID } from "../common";

export interface AgentHudProps {
  customProps: { pluginPagePath: string; }
}

const SELECTED_BUILD_QUERY_PARAM = `${PLUGIN_ID}_SELECTED_BUILD`;

export const AgentHud = ({ customProps: { pluginPagePath } }: AgentHudProps) => {
  const { agentId } = useAgentRouteParams();
  const { push } = useHistory();
  const queryParams = useQueryParams<Record<string, string>>();

  const { buildVersion: activeBuildVersion } = useActiveBuild(agentId) || {};
  const [selectedBuild, selectBuild] = useState<string | undefined>(queryParams[SELECTED_BUILD_QUERY_PARAM]);
  const { byTestType = [], finishedScopesCount = 0 } = useFilteredData<BuildCoverage>("/build/coverage",
    { buildVersion: selectedBuild }) || {};
  const buildVersions = useAdminConnection<BuildVersion[]>(`/agents/${agentId}/builds/summary`) || [];
  const { testsToRun: { count = 0, byType: testsToRunByType = {} } = {} } = useFilteredData<BuildSummary>("/build/summary",
    { buildVersion: selectedBuild }) || {};

  const totalTestsCount = byTestType.reduce((acc, { summary: { testCount = 0 } }) => acc + testCount, 0);
  const buildTestsByType = byTestType
    .reduce((acc, { type, summary: { testCount, coverage } }) => [...acc, { type, testCount, coverage: coverage?.percentage }],
      [] as TestType[]);
  const buildTestsToRun = Object.entries(testsToRunByType)
    .reduce((acc, [testType, testCount]) => [...acc, { type: testType, testCount }], [] as TestType[]);

  const { testSection, testToRunSection } = getTestsAndTests2RunSections({
    tests: buildTestsByType,
    tests2Run: buildTestsToRun,
    testsToRunCount: count,
    finishedScopesCount,
    totalTestsCount,
  });

  useEffect(() => {
    if (!selectedBuild && activeBuildVersion) { // select active build after the first receive data
      selectBuild(activeBuildVersion);
    }
  }, [activeBuildVersion]);

  if (!selectedBuild) return null;

  return (
    <PluginCard header={(
      <div tw="flex justify-between">
        <span tw="font-bold text-monochrome-default uppercase">test2code</span>
        <div tw="flex items-center gap-x-6">
          <Autocomplete
            tw="w-[240px]"
            defaultValue={selectedBuild}
            options={buildVersions.map(({ buildVersion }) => ({ label: buildVersion, value: buildVersion }))}
            onChange={(value: any) => {
              if (value !== selectedBuild) {
                selectBuild(value);
                push(addQueryParamsToPath({ [SELECTED_BUILD_QUERY_PARAM]: value }));
              }
            }}
          />
          <Link className="font-bold link no-underline" to={getTest2CodeOverviewPath(pluginPagePath, selectedBuild)}>Go to Plugin</Link>
        </div>
      </div>
    )}
    >
      <CoverageSection buildVersion={selectedBuild} />
      {testSection}
      <RisksSection buildVersion={selectedBuild} />
      {testToRunSection}
    </PluginCard>
  );
};

const getTest2CodeOverviewPath = (
  pluginPagePath: string,
  buildVersion: string,
): string => `${pluginPagePath}/builds/${buildVersion}/overview`;
