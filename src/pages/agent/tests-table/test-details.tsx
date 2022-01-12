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
  Icons, Stub, Table, Cells,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { capitalize } from "@drill4j/common-utils";
import { TestCoverageInfo } from "types/test-coverage-info";

import { AGENT_STATUS } from "common/constants";
import { FilterList } from "@drill4j/types-admin/dist";
import { useAgent, useAgentRouteParams } from "hooks";
import { transformTests } from "utils";
import { getModalPath } from "../../../common";

interface Props {
  tests: FilterList<TestCoverageInfo>;
  topicCoveredMethodsByTest: string;
}

const columns = [
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
    Header: "Status",
    accessor: "overview.result",
    Cell: ({ value }: any) => (
      <Cells.TestStatus
        tw="inline"
        type={value}
      >
        {capitalize(value)}
      </Cells.TestStatus>
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
    Header: "Methods covered",
    accessor: "coverage.methodCount.covered",
    sortType: "number",
    Cell: ({ value, row: { original: { id = "", coverage: { methodCount: { covered = 0 } = {} } = {} } = {} } = {} }: any) => (
      <Cells.Clickable
        tw="inline"
        data-test="test-actions:view-curl:id"
        disabled={!value}
      >
        <Link to={getModalPath({ name: "coveredMethods", params: { coveredMethods: covered, testId: id } })}>
          {value}
        </Link>
      </Cells.Clickable>
    ),
  },
  {
    Header: "Duration",
    accessor: "overview.duration",
    Cell: Cells.Duration,
    sortType: "number",
  }];

export const TestDetails = ({
  tests: { items: tests = [] },
}: Props) => {
  const { agentId } = useAgentRouteParams();
  const { status } = useAgent(agentId);

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
        title={status === AGENT_STATUS.BUSY ? "Build tests are loading" : "No tests available yet"}
        message={status === AGENT_STATUS.BUSY
          ? "It may take a few seconds."
          : "Information about project tests will appear after the first launch of tests."}
      />
    )), [tests.length]);

  return (
    <div tw="flex flex-col mt-8 flex-grow" data-test="test-details:table-wrapper">
      <Table
        data={transformTests(tests)}
        columns={columns}
        stub={stub}
        renderHeader={({ currentCount, totalCount }: { currentCount: number, totalCount: number }) => (
          <div tw="flex justify-between text-monochrome-default text-14 leading-24 pb-3">
            <div tw="uppercase font-bold">Application tests</div>
            <div>{`Displaying ${currentCount} of ${totalCount} tests`}</div>
          </div>
        )}
      />
    </div>
  );
};
