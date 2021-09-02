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
  capitalize, Cells, Table, TableActionsProvider,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import { getModalPath } from "common";
import { CoverageCell } from "../../methods-table/coverage-cell";

interface Props {
  data: Risk[];
}

export const RisksTable = ({ data }: Props) => {
  const columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ value = "", row: { original: { ownerClass = "" } = {} } = {} }: any) => (
        <Cells.Compound cellName={value} cellAdditionalInfo={ownerClass} />
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
      accessor: "associatedTestsCount",
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
    <TableActionsProvider>
      <Table
        data={data}
        columns={columns}
        withSearch
        isDefaulToggleSortBy
        defaultSortBy={[{ id: "coverage", desc: false }]}
      />
    </TableActionsProvider>
  );
};
