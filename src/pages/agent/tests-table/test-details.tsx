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
  Icons, Stub, Table, useTableActionsState,
} from "@drill4j/ui-kit";
import {
  Route, useParams, Link,
} from "react-router-dom";
import queryString from "query-string";
import "twin.macro";

import { capitalize } from "@drill4j/common-utils";
import { TestCoverageInfo } from "types/test-coverage-info";
import { Cells } from "components";

import { AGENT_STATUS } from "common/constants";
import { FilterList } from "@drill4j/types-admin/dist";
import { useAgent } from "../../../hooks";

interface Props {
  tests: FilterList<TestCoverageInfo>;
  topicCoveredMethodsByTest: string;
}

export const TestDetails = ({
  topicCoveredMethodsByTest, tests: { items: tests = [], totalCount = 0, filteredCount = 0 },
}: Props) => {
  const {
    pluginId, buildVersion, agentId, scopeId, tab,
  } = useParams<{buildVersion?: string; pluginId?: string; agentId?: string; scopeId?: string; tab?: string; }>();
  const { status } = useAgent(agentId);
  const { search } = useTableActionsState();
  const [searchQuery] = search;

  return (
    <div tw="flex flex-col">
      <>
        <Table
          isDefaulToggleSortBy
          filteredCount={filteredCount}
          totalCount={totalCount}
          placeholder="Search tests by name"
          data={tests}
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
            accessor: "stats.result",
            Cell: ({ value }: any) => (
              <Cells.TestStatus
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
                data-test="test-actions:view-curl:id"
                disabled={!value}
              >
                <Link to={scopeId
                  ? `/full-page/${agentId}/${buildVersion}/${pluginId}/scope/${
                    scopeId}/${tab}/covered-methods-modal?${queryString.stringify({ coveredMethods: covered, testId: id })}`
                  : `/full-page/${agentId}/${buildVersion}/${
                    pluginId}/dashboard/${tab}/covered-methods-modal?${queryString.stringify({ coveredMethods: covered, testId: id })}`}
                >
                  {value}
                </Link>
              </Cells.Clickable>
            ),
            width: "10%",
          },
          {
            Header: "Duration",
            accessor: "stats.duration",
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
