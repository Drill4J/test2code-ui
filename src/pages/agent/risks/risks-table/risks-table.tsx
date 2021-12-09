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
import { Risk, TestCoverageInfo } from "types";
import {
  capitalize, Cells, Icons, Stub, Table,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { getModalPath, getPagePath } from "common";
import { useBuildVersion } from "hooks";
import { FilterList } from "@drill4j/types-admin";
import { CoverageCell } from "../../methods-table/coverage-cell";

interface Props {
  data: Risk[];
  filteredCount: number;
}

export const RisksTable = ({ data }: Props) => {
  const {
    items: testsToRun = [],
    totalCount = 0,
  } = useBuildVersion<FilterList<TestCoverageInfo>>("/build/risks", { output: "LIST" }) || {};
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
            to={getPagePath({
              name: "test2code",
              queryParams: {
                activeTab: "methods",
                tableState: JSON.stringify({ filters: [{ id: "name", value: ownerClass.slice(0, ownerClass.lastIndexOf("/")) }] }),
                methodName: value,
                ownerClass,
              },
            })}
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
      Header: "Coverage, %",
      accessor: "coverage",
      Cell: ({ value = 0 }: { value: number }) => (
        <CoverageCell value={value} showCoverageIcon />
      ),
      width: "147px",
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
      name={`All risks methods (${totalCount})`}
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
      defaultSortBy={[{
        id: "coverage",
        desc: false,
      }]}
    />
  );
};
