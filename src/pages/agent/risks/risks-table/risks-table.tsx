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
import { Risk } from "types";
import {
  capitalize, Cells, Icons, Stub, Table,
  Link, Typography,
} from "@drill4j/ui-kit";
import "twin.macro";

import { getModalPath, getPagePath } from "common";
import queryString from "querystring";
import { RiskStat } from "types/risk";
import { CoverageCell } from "../../methods-table/coverage-cell";

interface Props {
  data: Risk[];
  filteredCount: number;
}

export const RisksTable = ({ data }: Props) => {
  const columns = [
    {
      Header: "Name",
      accessor: "name",
      filterable: true,
      isCustomCell: true,
      Cell: ({ value = "", row: { original: { ownerClass = "" } = {} } = {}, state }: any) => (
        <Cells.Compound
          cellName={value}
          cellAdditionalInfo={ownerClass}
          icon={<Icons.Function />}
        >
          <Link
            tw="link"
            to={`${getPagePath({ name: "test2code" })}?${queryString.stringify({ ownerClass, packageName: value })}`}
            target="_blank"
          >
            <Cells.Highlight text={value} searchWords={state.filters.map((filter: {value: string}) => filter.value)} />
          </Link>
        </Cells.Compound>
      ),
      width: "50%",
      textAlign: "left",
    },
    {
      Header: "Type",
      accessor: "type",
      Cell: ({ value }: any) => <>{capitalize(value)}</>,
      width: "127px",
      textAlign: "left",
    },
    {
      Header: "Current coverage, %",
      accessor: "coverage",
      Cell: ({ value = 0 }: { value: number }) => (
        <CoverageCell value={value} showCoverageIcon />
      ),
      width: "176px",
      sortType: "number",
    },
    {
      Header: "Previously covered, %",
      accessor: "previousCovered.coverage",
      Cell: ({ row: { original: { previousCovered } } }: { row: {original: {previousCovered: RiskStat}} }) => (
        previousCovered?.buildVersion ? (
          <div tw="text-12 text-monochrome-default leading-24">
            <span tw="text-14 text-monochrome-black">{previousCovered.coverage}</span>
            <Typography.MiddleEllipsis>
              <span title={`Build: ${previousCovered.buildVersion}`}>Build: {previousCovered.buildVersion}</span>
            </Typography.MiddleEllipsis>
          </div>
        ) : <div>&mdash;</div>
      ),
      width: "180px",
      sortType: "number",
    },
    {
      Header: "Associated Tests",
      accessor: "assocTestsCount",
      Cell: ({ value = "", row }: any) => (
        <Cells.Clickable
          data-test="risks-table:associated-tests-count"
          disabled={!value}
          tw="inline"
        >
          <Link to={getModalPath({ name: "associatedTests", params: { testId: row.original.id, treeLevel: "1" } })}>{value}</Link>
        </Cells.Clickable>
      ),
      width: "144px",
    },
  ];

  return (
    <Table
      name="ALL RISK METHODS"
      resultName="risk methods"
      data={data}
      columns={columns}
      stub={(
        <Stub
          icon={<Icons.Package height={104} width={107} />}
          title="No results found"
          message="Try adjusting your search or filter to find what you are looking for."
        />
      )}
    />
  );
};
