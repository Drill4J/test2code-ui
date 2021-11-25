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

import { useGroupRouteParams, useServiceGroup } from "hooks";
import { ServiceGroupSummary } from "types/service-group-summary";
import { PluginCard } from "./plugin-card";
import {
  CoverageSection, RisksSection,
} from "./service-group-sections";
import { addColors } from "./add-colors";
import { TestType } from "./agent-sections/section-tooltip";
import { TestsSection, TestsToRunSection } from "./agent-sections";

export interface GroupHudProps {
  customProps: { pluginPagePath: string; }
}

const testsDataStub = [
  { type: "Auto", testCount: 0, coverage: 0 },
  { type: "Manual", testCount: 0, coverage: 0 },
];

export const ServiceGroupHud = ({ customProps: { pluginPagePath } }: GroupHudProps) => {
  const { groupId } = useGroupRouteParams();
  const {
    aggregated: {
      scopeCount = 0,
      coverage = 0,
      methodCount = {},
      tests = [],
      testsToRun = {},
      riskCounts = {},
    } = {},
  } = useServiceGroup<ServiceGroupSummary>("/group/summary", groupId, "test2code") || {};

  let testSection;
  let testToRunSection;
  const { count: testsToRunCount = 0 } = testsToRun;
  const { byType = {} } = testsToRun;
  const groupTests: TestType[] = tests
    .map(({ type, summary: { testCount, coverage: { percentage } = {} } }) => ({ type, testCount, coverage: percentage }));
  const totalTestsCount = groupTests.reduce((acc, { testCount = 0 }) => acc + testCount, 0);
  const testsToRunByType = Object.entries(byType).map(([testType, testCount]) => ({ type: testType, testCount }));

  if (groupTests.length === 0 && testsToRunByType.length === 0) {
    const testsColors = addColors(["Auto", "Manual"]);
    testSection = (
      <TestsSection
        data={testsDataStub}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={scopeCount}
      />
    );
    testToRunSection = <TestsToRunSection data={testsDataStub} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else if (groupTests.length > 0 && testsToRunByType.length > 0) {
    const testsColors = addColors([...testsToRunByType, ...groupTests].map(({ type = "" }) => type));
    testSection = (
      <TestsSection
        data={groupTests}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={scopeCount}
      />
    );
    testToRunSection = <TestsToRunSection data={testsToRunByType} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else if (groupTests.length > 0) {
    const stubData = groupTests.map((test) => ({ ...test, coverage: 0, testCount: 0 }));
    const testsColors = addColors(tests.map((test) => test.type));
    testSection = (
      <TestsSection
        data={groupTests}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={scopeCount}
      />
    );
    testToRunSection = <TestsToRunSection data={stubData} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else {
    const stubData = testsToRunByType.map((test) => ({ ...test, coverage: 0, testCount: 0 }));
    const testsColors = addColors(testsToRunByType.map((test) => test.type));
    testSection = (
      <TestsSection
        data={stubData}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={scopeCount}
      />
    );
    testToRunSection = <TestsToRunSection data={testsToRunByType} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  }

  return (
    <PluginCard pluginLink={pluginPagePath}>
      <CoverageSection totalCoverage={coverage} methodCount={methodCount} />
      {testSection}
      <RisksSection risks={riskCounts} />
      {testToRunSection}
    </PluginCard>
  );
};
