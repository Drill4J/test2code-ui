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
import { TestsSection, TestsToRunSection } from "./agent-sections";
import { TestType } from "./agent-sections/section-tooltip";

interface Arguments {
  finishedScopesCount: number;
  totalTestsCount: number;
  testsToRunCount: number;
  tests: TestType[];
  tests2Run: TestType[];
}

const testsDataStub = [
  { type: "Auto", testCount: 0, coverage: 0 },
  { type: "Manual", testCount: 0, coverage: 0 },
];

export const getTestsAndTests2RunSections = ({
  finishedScopesCount, totalTestsCount, testsToRunCount, tests, tests2Run,
}: Arguments) => {
  let testSection;
  let testToRunSection;
  if (tests.length === 0 && tests2Run.length === 0) {
    const testsColors = addColors(["Auto", "Manual"]);
    testSection = (
      <TestsSection
        data={testsDataStub}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={finishedScopesCount}
      />
    );
    testToRunSection = <TestsToRunSection data={testsDataStub} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else if (tests.length > 0 && tests2Run.length > 0) {
    const testsColors = addColors([...tests2Run, ...tests].map(({ type = "" }) => type));
    testSection = (
      <TestsSection
        data={tests}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={finishedScopesCount}
      />
    );
    testToRunSection = <TestsToRunSection data={tests2Run} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else if (tests.length > 0) {
    const stubData = tests.map((test) => ({ ...test, coverage: 0, testCount: 0 }));
    const testsColors = addColors(tests.map(({ type = "" }) => type));
    testSection = (
      <TestsSection
        data={tests}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={finishedScopesCount}
      />
    );
    testToRunSection = <TestsToRunSection data={stubData} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  } else {
    const stubData = tests2Run.map((test) => ({ ...test, coverage: 0, testCount: 0 }));
    const testsColors = addColors(tests2Run.map(({ type = "" }) => type));
    testSection = (
      <TestsSection
        data={stubData}
        totalTestsCount={totalTestsCount}
        testsColors={testsColors}
        finishedScopesCount={finishedScopesCount}
      />
    );
    testToRunSection = <TestsToRunSection data={tests2Run} testsColors={testsColors} testsToRunCount={testsToRunCount} />;
  }
  return { testSection, testToRunSection };
};

export const addColors = (tests: string[]) => {
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
};
