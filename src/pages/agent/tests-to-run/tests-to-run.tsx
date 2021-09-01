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
  Icons, Legend, Stub, Table, useTableActionsState, Cells,
} from "@drill4j/ui-kit";
import { capitalize } from "@drill4j/common-utils";
import { FilterList } from "@drill4j/types-admin";
import { Link } from "react-router-dom";
import "twin.macro";

import { getModalPath, DATA_VISUALIZATION_COLORS } from "common";
import { TestCoverageInfo } from "types/test-coverage-info";
import { BuildSummary } from "types/build-summary";
import { TestsInfo } from "types/tests-info";
import { ParentBuild } from "types/parent-build";
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
    filteredCount = 0,
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
        <span tw="text-12 leading-32 font-bold text-monochrome-default uppercase" data-test="tests-to-run-list:table-title">
          all suggested tests ({totalCount})
        </span>
        <div>
          <Table
            isDefaulToggleSortBy
            filteredCount={filteredCount}
            placeholder="Search tests by name"
            data={testsToRun}
            withSearch
            columns={[{
              Header: "Name",
              accessor: "name",
              Cell: ({ value }: any) => (
                <Cells.Compound cellName={value} cellAdditionalInfo="&ndash;" icon={<Icons.Test height={16} width={16} />} />
              ),
              textAlign: "left",
              width: "50%",
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
              width: "10%",
            },
            {
              Header: "State",
              accessor: "details.result",
              Cell: ({ row: { original: { toRun } } }: any) => (
                <span tw="leading-64">
                  {toRun
                    ? "To run"
                    : <span tw="font-bold text-green-default">Done</span>}
                </span>
              ),
              textAlign: "left",
              width: "10%",
            },
            {
              Header: "Coverage, %",
              accessor: "coverage.percentage",
              Cell: ({ value, row: { original: { toRun } } }: any) => (toRun ? null : <Cells.Coverage tw="inline" value={value} />),
              width: "10%",
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
              width: "10%",
            },
            {
              Header: "Duration",
              accessor: "details.duration",
              Cell: ({ value, row: { original: { toRun } } }: any) => (toRun ? null : <Cells.Duration value={value} />),
              width: "10%",
            }]}
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
