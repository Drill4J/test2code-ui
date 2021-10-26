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
  CoverageSection, RisksSection, TestsSection, TestsToRunSection,
} from "./agent-sections";
import { useBuildVersion } from "../hooks";
import { BuildCoverage, BuildSummary } from "../types";
import { TestType } from "./agent-sections/section-tooltip";

export interface AgentHudProps {
  customProps: { pluginPagePath: string; }
}

export const AgentHud = ({ customProps: { pluginPagePath } }: AgentHudProps) => {
  const { testsToRun: { count = 0, byType: testsToRunByType = {} } = {} } = useBuildVersion<BuildSummary>("/build/summary") || {};
  const { byTestType = [], finishedScopesCount = 0 } = useBuildVersion<BuildCoverage>("/build/coverage") || {};

  const totalCoveredMethodCount = byTestType.reduce((acc, { summary: { testCount = 0 } }) => acc + testCount, 0);
  const buildTestsByType = byTestType
    .reduce((acc, { type, summary: { testCount, coverage } }) => [...acc, { type, testCount, coverage: coverage?.percentage }],
      [] as TestType[]);
  const buildTestsToRun = Object.entries(testsToRunByType)
    .reduce((acc, [testType, testCount]) => [...acc, { type: testType, testCount }], [] as TestType[]);

  const buildTestTypes = byTestType.map((data) => data.type);
  const buildTestToTunTypes = Object.keys(testsToRunByType);
  const testsColors = addColors([...buildTestTypes, ...buildTestToTunTypes]);

  return (
    <PluginCard pluginLink={pluginPagePath}>
      <CoverageSection />
      <TestsSection
        data={buildTestsByType}
        totalCoveredMethodCount={totalCoveredMethodCount}
        testsColors={testsColors}
        finishedScopesCount={finishedScopesCount}
      />
      <RisksSection />
      <TestsToRunSection data={buildTestsToRun} testsColors={testsColors} testsToRunCount={count} />
    </PluginCard>
  );
};
function addColors(tests: string[]) {
  const colors = [
    "#D599FF",
    "#88E2F3",
    "#F0876F",
    "#A3D381",
    "#E677C3",
    "#EE7785",
    "#5FEDCE",
    "#FF7FA8",
    "#E79B5F",
    "#6B7EED",
    "#FF9291",
    "#D6AF5C",
    "#B878DC",
    "#FFA983",
    "#BFC267",
    "#83E1A5",
    "#EDD78E",
  ];
  return tests.reduce((acc, testType, i) => ({ ...acc, [testType]: colors[i] }), {});
}
