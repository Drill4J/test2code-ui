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
  Cells, Icons, Stub, Table,
} from "@drill4j/ui-kit";

interface TestTypeSummary {
  type?: string;
  coverage?: number;
}

interface Props {
  data: TestTypeSummary[];
}

export const TestsTypeTable = ({ data }: Props) => (
  <Table
    data={data}
    columns={[
      {
        Header: "Test Type",
        accessor: "type",
        textAlign: "left",
      },
      {
        Header: "Coverage, %",
        accessor: "coverage",
        textAlign: "left",
        Cell: Cells.Coverage,

      },
    ]}
    isDefaulToggleSortBy
    stub={!data.length && (
      <Stub
        icon={<Icons.Test height={104} width={107} />}
        title="No tests available yet"
        message="Information about project tests will appear after the first launch of tests."
      />
    )}
  />
);
