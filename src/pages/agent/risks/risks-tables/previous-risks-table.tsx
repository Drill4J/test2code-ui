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
  Cells, Icons, Stub, Table, Tooltip, CopyButton, Typography,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import "twin.macro";

import { useNavigation, useTestToCodeRouteParams } from "hooks";
import { StubRisks } from "./stub-risks";

interface Props {
  data: Risk[];
}

export const PreviousRisksTable = ({ data }: Props) => {
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();

  if (!data.length) return <StubRisks />;

  const columns = [
    {
      Header: "Name",
      accessor: "name",
      filterable: true,
      isCustomCell: true,
      Cell: ({ value = "", row: { original: { ownerClass = "", desc = "" } = {} } = {}, state }: any) => (
        <Cells.Compound
          cellName={value}
          cellAdditionalInfo={ownerClass}
          icon={<Icons.Function />}
          link={(
            <Link
              to={getPagePath({
                name: "overview",
                params: { buildVersion },
                queryParams: {
                  activeTab: "methods",
                  tableState: JSON.stringify({ filters: [{ id: "name", value: ownerClass.slice(0, ownerClass.lastIndexOf("/")) }] }),
                  methodName: value,
                  methodOwnerClass: ownerClass,
                  methodDesc: desc,
                },
              })}
              tw="max-w-280px text-monochrome-black text-14 text-ellipsis link"
              title={value}
              target="_blank"
            >
              <Tooltip
                position="top-center"
                message={(
                  <div tw="flex gap-x-2">
                    <span>Navigate to method in Application package</span>
                    <Icons.NewWindow />
                  </div>
                )}
              >
                <Icons.NewWindow />
              </Tooltip>
            </Link>
          )}
        >
          <div tw="flex items-center gap-x-2">
            <Cells.Highlight text={value} searchWords={state.filters.map((filter: {value: string}) => filter.value)} />
            <CopyButton text={value} />
          </div>
        </Cells.Compound>
      ),
      width: "50%",
      textAlign: "left",
    },
    {
      Header: "Build",
      accessor: "previousCovered.buildVersion",
      Cell: ({ value }: any) => <span title={value}><Typography.MiddleEllipsis><span>{value}</span></Typography.MiddleEllipsis></span>,
      width: "176px",
      textAlign: "left",
    },
    {
      Header: "Coverage, %",
      accessor: "previousCovered.coverage",
      Cell: ({ value = 0 }: { value: number }) => (!value ? <>-</> : <Cells.CoverageProgress tw="justify-between" value={value} />),
      width: "176px",
      textAlign: "left",
      sortType: "number",
    },
  ];

  return (
    <Table
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
      renderHeader={({ currentCount, totalCount }: { currentCount: number, totalCount: number }) => (
        <div tw="flex justify-between text-monochrome-default text-14 leading-24 pb-3">
          <div tw="flex gap-x-2 items-center uppercase font-bold">
            Risked methods
            <Tooltip
              position="top-right"
              message={(
                <div tw="text-[13px] leading-20">
                  The coverage of Risked Methods is indicated{"\n"}
                  based on the build where it was the highest.
                </div>
              )}
            >
              <Icons.Info />
            </Tooltip>
          </div>
          <div data-test="risks-list:table-title">{`Displaying ${currentCount} of ${totalCount} methods`}</div>
        </div>
      )}
    />
  );
};
