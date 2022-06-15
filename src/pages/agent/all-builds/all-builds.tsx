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

import { Link } from "react-router-dom";
import {
  Table, Typography, dateTimeFormatter, Stub, Icons, Tooltip,
} from "@drill4j/ui-kit";
import { BuildVersion } from "@drill4j/types-admin";
import tw, { styled } from "twin.macro";

import {
  useActiveBuild, useAdminConnection, useAgentRouteParams, useBuildVersion, useNavigation,
} from "hooks";
import { PageHeader } from "components";

export const AllBuilds = () => {
  const { agentId } = useAgentRouteParams();
  const { getPagePath } = useNavigation();
  const buildVersions = useAdminConnection<BuildVersion[]>(`/agents/${agentId}/builds/summary`) || [];
  const { buildVersion: activeBuildVersion = "" } = useActiveBuild(agentId) || {};
  const { version: baseline } = useBuildVersion("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = (build: string) => build === baseline;

  return (
    <div tw="flex flex-col flex-grow">
      <PageHeader tw="gap-x-2 text-24 leading-32 text-monochrome-black">
        <span>All builds </span>
        <span tw="font-light text-monochrome-default">{buildVersions.length}</span>
      </PageHeader>
      <div tw="px-6 flex flex-col flex-grow">
        <Table
          renderHeader={({ currentCount, totalCount }) => (
            <div tw="flex justify-between text-monochrome-default text-14 leading-24 mt-9 mb-3">
              <div tw="uppercase">Builds List</div>
              <div>{`Displaying ${currentCount} of ${totalCount} builds`}</div>
            </div>
          )}
          columns={[
            {
              Header: "Name",
              accessor: "buildVersion",
              filterable: true,
              isCustomCell: true,
              Cell: ({ value: buildVersion }: any) => (
                <NameCell title={buildVersion}>
                  <Link
                    tw="link text-ellipsis"
                    to={getPagePath({ name: "overview", params: { buildVersion }, queryParams: { activeTab: "methods" } })}
                    data-test="builds-table:buildVersion"
                  >
                    <Typography.MiddleEllipsis>
                      <span>{buildVersion}</span>
                    </Typography.MiddleEllipsis>
                  </Link>
                  {isBaseline(buildVersion) && (
                    <Tooltip
                      position="top-right"
                      message={(
                        <>
                          <div tw="font-bold">This build is set as baseline.</div>
                          <div>
                            All subsequent builds are compared with it.
                          </div>
                        </>
                      )}
                    >
                      <Icons.Flag />
                    </Tooltip>
                  )}
                </NameCell>
              ),
              textAlign: "left",
            },
            {
              Header: "Added",
              accessor: "detectedAt",
              width: "400px",
              Cell: ({ value }: any) => <span>{dateTimeFormatter(value)}</span>,
              textAlign: "left",
            },
            {
              Header: "Total methods",
              accessor: "summary.total",
            },
            {
              Header: "New",
              accessor: "summary.new",
            },
            {
              Header: "Modified",
              accessor: "summary.modified",
            },
            {
              Header: "Unaffected",
              accessor: "summary.unaffected",
            },
            {
              Header: "Deleted",
              accessor: "summary.deleted",
            },
          ]}
          data={buildVersions}
          defaultSortBy={[{
            id: "detectedAt",
            desc: true,
          }]}
          stub={(
            <Stub
              icon={<Icons.BuildList height={104} width={107} />}
              title="No results found"
              message="Try adjusting your search or filter to find what you are looking for."
            />
          )}
          columnsDependency={[baseline]}
        />
      </div>
    </div>
  );
};

const NameCell = styled.div`
  ${tw`grid gap-x-2 h-12 items-center`}
  grid-template-columns: minmax(auto, max-content) max-content;
  ${tw`font-bold text-14`}
`;
