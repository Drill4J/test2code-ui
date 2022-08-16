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
  Icons, Stub, Table, Cells, Label, Tooltip, LinkButton,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { capitalize } from "@drill4j/common-utils";
import { TestCoverageInfo } from "types/test-coverage-info";

import { useActiveBuild, useAgentRouteParams } from "hooks";
import { transformTests } from "utils";
import { Label as LabelType } from "types";
import { getModalPath, BUILD_STATUS } from "common";
import { ColumnFilterByValues, TestsStatus } from "components";
import { filterByValues } from "components/column-filter-by-values";

interface Props {
  tests: TestCoverageInfo[];
  topicCoveredMethodsByTest: string;
  testTypes: string[]
}

export const TestDetails = ({ tests, testTypes }: Props) => {
  const { agentId } = useAgentRouteParams();
  const { buildStatus } = useActiveBuild(agentId) || {};

  const columns = useMemo(() => getColumns(testTypes), [testTypes]);

  const stub = useMemo(() => (tests.length > 0
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
        title={buildStatus === BUILD_STATUS.BUSY ? "Build tests are loading" : "No tests available yet"}
        message={buildStatus === BUILD_STATUS.BUSY
          ? "It may take a few seconds."
          : "Information about project tests will appear after the first launch of tests."}
      />
    )), [tests.length]);

  const transformedTests = useMemo(() => transformTests(tests), [tests]);

  return (
    <div tw="flex flex-col mt-8 flex-grow" data-test="test-details:table-wrapper">
      <Table
        data={transformedTests}
        columns={columns}
        stub={stub}
        renderHeader={({ currentCount, totalCount }: { currentCount: number, totalCount: number }) => (
          <div tw="flex justify-between text-monochrome-default text-14 leading-24 pb-3">
            <div tw="uppercase font-bold">Application tests</div>
            <div>{`Displaying ${currentCount} of ${totalCount} tests`}</div>
          </div>
        )}
        columnsDependency={[testTypes] as any}
      />
    </div>
  );
};

const getColumns = (testTypes: string[]) => [
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
    Header: "Labels",
    accessor: "overview.details.labels",
    textAlign: "left",
    width: "232px",
    isCustom: true,
    Cell: ({ value: labels }: {value: LabelType[]}) => {
      const [firstLabel, secondLabel, ...restLabels] = labels;
      const firstLabelContent = firstLabel ? `${firstLabel?.name}: ${firstLabel?.value}` : null;
      const secondLabelContent = secondLabel ? `${secondLabel?.name}: ${secondLabel?.value}` : null;

      return (
        <>
          {firstLabel && <Label tw="max-w-[100%] truncate mb-1" title={firstLabelContent}>{firstLabelContent}</Label>}
          {secondLabelContent && (
            <div tw="flex gap-x-1 w-full">
              <Label tw="truncate" title={secondLabelContent}>{secondLabelContent}</Label>
              {restLabels.length && (
                <Tooltip message={restLabels.map(({ name, value }) => <div>{name}: {value}</div>)}>
                  <Label>+{restLabels.length}</Label>
                </Tooltip>
              )}
            </div>
          )}
        </>
      );
    },
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
    filterable: true,
    filter: filterByValues("type"),
    Filter: ColumnFilterByValues(testTypes.map((type) => ({ label: type, value: type }))),
  },
  {
    Header: "Status",
    accessor: "overview.result",
    Cell: ({ value }: any) => (
      <TestsStatus status={value} />
    ),
    textAlign: "left",
  },
  {
    Header: "Coverage, %",
    accessor: "coverage.percentage",
    Cell: Cells.Coverage,
    sortType: "number",
  },
  {
    Header: "Duration",
    accessor: "overview.duration",
    Cell: Cells.Duration,
    sortType: "number",
  },
  {
    Header: "Methods covered",
    accessor: "coverage.methodCount.covered",
    sortType: "number",
    Cell: ({ value, row: { original: { id = "", coverage: { methodCount: { covered = 0 } = {} } = {} } = {} } = {} }: any) => (
      <Cells.Clickable
        tw="inline  no-underline"
        disabled={!value}
      >
        {value ? (
          <LinkButton>
            <Link to={getModalPath({ name: "coveredMethods", params: { coveredMethods: covered, testId: id } })}>
              {value}
            </Link>
          </LinkButton>
        ) : value}
      </Cells.Clickable>
    ),
  }];
