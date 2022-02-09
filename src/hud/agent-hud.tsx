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
import { PluginCard } from "./plugin-card";
import {
  CoverageSection, RisksSection,
} from "./agent-sections";
import { useActiveBuild, useAgentRouteParams, useBuildVersion } from "../hooks";
import { BuildCoverage, BuildSummary } from "../types";
import { TestType } from "./agent-sections/section-tooltip";
import { getTestsAndTests2RunSections } from "./get-tests-and-tests-2-run-sections";

export interface AgentHudProps {
  customProps: { pluginPagePath: string; }
}

export const AgentHud = ({ customProps: { pluginPagePath } }: AgentHudProps) => {
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useActiveBuild(agentId) || {};
  const { testsToRun: { count = 0, byType: testsToRunByType = {} } = {} } = useBuildVersion<BuildSummary>("/build/summary",
    { buildVersion }) || {};
  const { byTestType = [], finishedScopesCount = 0 } = useBuildVersion<BuildCoverage>("/build/coverage", { buildVersion }) || {};

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

  return (
    <PluginCard pluginLink={pluginPagePath}>
      <CoverageSection buildVersion={buildVersion} />
      {testSection}
      <RisksSection buildVersion={buildVersion} />
      {testToRunSection}
    </PluginCard>
  );
};
