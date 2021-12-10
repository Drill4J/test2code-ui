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
import React, { useMemo } from "react";
import {
  Icons, Legend, Stub, Table, useTableActionsState, Cells,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import { capitalize } from "@drill4j/common-utils";
import { FilterList } from "@drill4j/types-admin";

import "twin.macro";

import { getModalPath, DATA_VISUALIZATION_COLORS } from "common";
import { TestCoverageInfo } from "types/test-coverage-info";
import { BuildSummary } from "types/build-summary";
import { TestsInfo } from "types/tests-info";
import { ParentBuild } from "types/parent-build";
import { transformTests } from "utils";
import { useBuildVersion, useAgent, useAgentRouteParams } from "hooks";

import { TestsToRunSummary } from "types/tests-to-run-summary";
import { TestsToRunHeader } from "./tests-to-run-header";
import { BarChart } from "./bar-chart";

interface Props {
  agentType?: string;
}

export const TestsToRun = ({ agentType = "Agent" }: Props) => {
  const { search } = useTableActionsState();
  const {
    items: testsToRun = [],
    totalCount = 0,
  } = useBuildVersion<FilterList<TestCoverageInfo>>("/build/tests-to-run", { filters: search, output: "LIST" }) || {};

  const { buildVersion, agentId } = useAgentRouteParams();
  const { buildVersion: activeBuildVersion = "" } = useAgent(agentId) || {};
  const { version: previousBuildVersion = "" } = useBuildVersion<ParentBuild>("/data/parent") || {};
  const summaryTestsToRun = useBuildVersion<TestsToRunSummary>("/build/summary/tests-to-run") || {};
  const { tests: previousBuildTests = [], testDuration: totalDuration = 1 } = useBuildVersion<BuildSummary>(
    "/build/summary", { buildVersion: previousBuildVersion },
  ) || {};
  const { AUTO } = previousBuildTests
    .reduce((test, testType) => ({ ...test, [testType.type]: testType }), {}) as TestsInfo;
  const previousBuildAutoTestsCount = AUTO?.summary?.testCount || 0;

  const stub = useMemo(() => (testsToRun.length > 0
    ? (
      <Stub
        icon={<Icons.Test height={104} width={107} />}
        title="No results found"
        message="Try adjusting your search or filter to find what you are looking for."
      />
    )
    : (
      <Stub
        icon={<Icons.Test height={104} width={107} />}
        title="No suggested tests"
        message="There is no information about the suggested to run tests in this build."
      />
    )), [testsToRun.length]);

  return (
    <div tw="flex flex-col gap-4">
      <TestsToRunHeader
        agentInfo={{
          agentType, buildVersion, previousBuildVersion, activeBuildVersion,
        }}
        summaryTestsToRun={summaryTestsToRun}
        previousBuildTestsDuration={totalDuration}
        previousBuildAutoTestsCount={previousBuildAutoTestsCount}
      />
      <div tw="flex justify-between items-start w-full">
        <span tw="h-6 align-top text-12 leading-16 font-bold text-monochrome-default uppercase" data-test="tests-to-run-list:bar-title">
          saved time history
        </span>
        <Legend
          legendItems={[
            { label: "No data", borderColor: DATA_VISUALIZATION_COLORS.SAVED_TIME, color: "transparent" },
            { label: "Saved time", color: DATA_VISUALIZATION_COLORS.SAVED_TIME },
            { label: "Duration with Drill4J", color: DATA_VISUALIZATION_COLORS.DURATION_WITH_D4J },
          ]}
        />
      </div>
      {previousBuildAutoTestsCount ? (
        <BarChart
          activeBuildVersion={activeBuildVersion}
          totalDuration={totalDuration}
          summaryTestsToRun={summaryTestsToRun}
        />
      ) : (
        <Stub
          icon={<Icons.Graph tw="text-monochrome-medium-tint" width={70} height={75} />}
          title="No data about saved time"
          message="There is no information about Auto Tests duration in the parent build."
        />
      )}
      <div>
        <div tw="flex flex-col mt-8">
          <Table
            data={transformTests(testsToRun)}
            stub={stub}
            columns={[
              {
                Header: "Name",
                accessor: "overview.details.name",
                textAlign: "left",
                filterable: true,
              },
              {
                Header: "Path",
                accessor: "overview.details.path",
                textAlign: "left",
                filterable: true,
              },
              {
                Header: "Test type",
                accessor: "type",
                Cell: ({ value }: any) => (
                  <>
                    {capitalize(value)}
                  </>
                ),
                textAlign: "left",
              },
              {
                Header: "State",
                accessor: "overview.result",
                Cell: ({ row: { original: { toRun } } }: any) => (
                  <span tw="leading-64">
                    {toRun
                      ? "To run"
                      : <span tw="font-bold text-green-default">Done</span>}
                  </span>
                ),
                textAlign: "left",
              },
              {
                Header: "Coverage, %",
                accessor: "coverage.percentage",
                Cell: ({ value, row: { original: { toRun } } }: any) => (toRun ? null : <Cells.Coverage tw="inline" value={value} />),
              },
              {
                Header: "Methods covered",
                accessor: "coverage.methodCount.covered",
                Cell: ({
                  value,
                  row: { original: { id = "", toRun = false, coverage: { methodCount: { covered = 0 } = {} } = {} } = {} },
                }: any) => (
                  toRun ? null : (
                    <Cells.Clickable
                      tw="inline"
                      disabled={!value}
                    >
                      <Link to={getModalPath({ name: "coveredMethods", params: { coveredMethods: covered, testId: id } })}>
                        {value}
                      </Link>
                    </Cells.Clickable>
                  )
                ),
              },
              {
                Header: "Duration",
                accessor: "overview.duration",
                Cell: ({ value, row: { original: { toRun } } }: any) => (toRun ? null : <Cells.Duration value={value} />),
              }]}
            renderHeader={({ currentCount }: { currentCount: number }) => (
              <div tw="flex justify-start text-monochrome-default text-14 leading-24 pb-3">
                <div tw="uppercase font-bold">{`All suggested tests (${currentCount})`}</div>
              </div>
            )}
          />
        </div>
      </div>
      {!testsToRun.length && (
        <Stub
          icon={<Icons.Test tw="text-monochrome-medium-tint" width={80} height={80} />}
          title="No suggested tests"
          message="There is no information about the suggested to run tests in this build."
        />
      )}
    </div>
  );
};
