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
  Icons, Stub, Table, useTableActionsState, Cells,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { capitalize } from "@drill4j/common-utils";
import { TestCoverageInfo } from "types/test-coverage-info";

import { AGENT_STATUS } from "common/constants";
import { FilterList } from "@drill4j/types-admin/dist";
import { useAgent, useAgentRouteParams } from "hooks";
import { getModalPath } from "../../../common";

interface Props {
  tests: FilterList<TestCoverageInfo>;
  topicCoveredMethodsByTest: string;
}

export const TestDetails = ({
  tests: { items: tests = [], filteredCount = 0 },
}: Props) => {
  const { agentId } = useAgentRouteParams();
  const { status } = useAgent(agentId);
  const { search } = useTableActionsState();
  const [searchQuery] = search;

  return (
    <div tw="flex flex-col">
      <>
        <Table
          isDefaulToggleSortBy
          filteredCount={filteredCount}
          placeholder="Search tests by name"
          data={tests}
          withSearch
          columns={[{
            Header: "Name",
            accessor: "testName",
            Cell: ({ row }: any) => (
              <Cells.Compound cellName={row.original.name} cellAdditionalInfo="&ndash;" icon={<Icons.Test height={16} width={16} />} />
            ),
            textAlign: "left",
            width: "56%",
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
            Header: "Status",
            accessor: "details.result",
            Cell: ({ value }: any) => (
              <Cells.TestStatus
                tw="inline"
                type={value}
              >
                {capitalize(value)}
              </Cells.TestStatus>
            ),
            textAlign: "left",
            width: "7%",
          },
          {
            Header: "Coverage, %",
            accessor: "coverage.percentage",
            Cell: Cells.Coverage,
            width: "7%",
          },
          {
            Header: "Methods covered",
            accessor: "coverage.methodCount.covered",
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
            width: "10%",
          },
          {
            Header: "Duration",
            accessor: "details.duration",
            Cell: Cells.Duration,
            width: "10%",
          }]}
        />
      </>
      {!tests.length && !searchQuery?.value && (
        <Stub
          icon={<Icons.Test height={104} width={107} />}
          title={status === AGENT_STATUS.BUSY ? "Build tests are loading" : "No tests available yet"}
          message={status === AGENT_STATUS.BUSY
            ? "It may take a few seconds."
            : "Information about project tests will appear after the first launch of tests."}
        />
      )}
      {!filteredCount && searchQuery?.value && (
        <Stub
          icon={<Icons.Test height={104} width={107} />}
          title="No results found"
          message="Try adjusting your search or filter to find what you are looking for."
        />
      )}
    </div>
  );
};
