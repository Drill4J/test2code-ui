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
import { Menu } from "@drill4j/ui-kit";
import { percentFormatter } from "@drill4j/common-utils";
import tw, { styled } from "twin.macro";

import { List, ListColumn, Modals } from "components";
import { ServiceGroupSummary } from "types/service-group-summary";
import { useGroupData, useGroupRouteParams } from "hooks";
import { getGroupModalPath, routes as agentRoutes } from "common";
import { TestToCodeNameCell } from "./test-to-code-name-cell";
import { TestToCodeCoverageCell } from "./test-to-code-coverage-cell";
import { TestToCodeCell } from "./test-to-code-cell";
import { TestToCodeHeaderCell } from "./test-to-code-header-cell";

export interface GroupRootComponentProps {
  getAgentPluginPath: (props: { agentId: string; buildVersion: string; path?: string}) => string;
  getAgentDashboardPath: (props: { agentId: string; buildVersion: string; }) => string;
  getAgentSettingsPath: (agentId: string) => string;
}

export const Group = ({ getAgentPluginPath, getAgentSettingsPath, getAgentDashboardPath }: GroupRootComponentProps) => {
  const { groupId } = useGroupRouteParams();
  const { summaries = [], aggregated } = useGroupData<ServiceGroupSummary>("/group/summary", groupId) || {};
  const serviceGroupSummaries = summaries.map((agentSummary) => ({
    ...agentSummary,
    ...agentSummary.summary,
  }));

  return (
    <div>
      <List
        data={serviceGroupSummaries}
        gridTemplateColumns="3fr repeat(3, 1fr) 50px"
        testContext="test-to-code-plugin"
      >
        <ListColumn
          name="name"
          Cell={({
            value,
            item: { buildVersion = "", id: agentId = "" },
          }: {
            value: string;
            item: { buildVersion?: string; id?: string };
          }) => (
            <TestToCodeNameCell
              name={value}
              additionalInformation={`Build: ${buildVersion}`}
              link={getAgentDashboardPath({ buildVersion, agentId })}
            />
          )}
          HeaderCell={() => <div tw="font-light text-24 leading-32">Test2Code</div>}
        />
        <ListColumn
          name="coverage"
          label="Coverage"
          Cell={({ value }) => <TestToCodeCoverageCell value={value} />}
          HeaderCell={() => (
            <TestToCodeHeaderCell
              value={`${percentFormatter(aggregated?.coverage || 0)}%`}
              label="coverage"
            />
          )}
        />
        <ListColumn
          name="risks"
          Cell={({ value }) => <TestToCodeCell link="#" value={value} name="risks" />}
          HeaderCell={() => <TestToCodeHeaderCell value={aggregated?.risks || 0} label="risks" />}
        />
        <ListColumn
          name="testsToRun"
          Cell={({ value, item: { id: agentId = "", buildVersion = "" } = {} }) => (
            <TestToCodeCell
              value={value?.count}
              name="tests-to-run"
              link={getAgentPluginPath({ buildVersion, agentId, path: agentRoutes.testsToRun })}
            />
          )}
          HeaderCell={() => (
            <TestToCodeHeaderCell
              value={aggregated?.testsToRun?.count || 0}
              label="tests to run"
              path={getGroupModalPath({ name: "testsToRun" })}
            />
          )}
        />
        <ListColumn
          name="actions"
          Cell={({ item: { id: agentId = "" } }) => (
            <MenuWrapper>
              <Menu
                testContext="test-to-code-plugin:actions:cell"
                items={[
                  {
                    label: "Builds list",
                    icon: "BuildList",
                    onClick: () => null,
                    Content: ({ children }: { children: JSX.Element }) => (
                      <Link to={`/agents/${agentId}/builds`}>{children}</Link>
                    ),
                  },
                  {
                    label: "Settings",
                    icon: "Settings",
                    onClick: () => null,
                    Content: ({ children }: { children: JSX.Element }) => (
                      <Link to={getAgentSettingsPath(agentId)}>
                        {children}
                      </Link>
                    ),
                  },
                ]}
              />
            </MenuWrapper>
          )}
          HeaderCell={() => (
            <MenuWrapper>
              <Menu
                testContext="test-to-code-plugin:header-cell:actions"
                items={[
                  {
                    label: "Finish all scopes",
                    icon: "Check",
                    onClick: () => null,
                    Content: ({ children }: { children: JSX.Element }) => (
                      <Link
                        to={getGroupModalPath({ name: "finishAllScopes" })}
                      >
                        {children}
                      </Link>
                    ),
                  },
                  {
                    label: "Sessions Management",
                    icon: "ManageSessions",
                    onClick: () => null,
                    Content: ({ children }: { children: JSX.Element }) => (
                      <Link to={getGroupModalPath({ name: "sessionManagement" })}>
                        {children}
                      </Link>
                    ),
                  },
                ]}
              />
            </MenuWrapper>
          )}
        />
      </List>
      <Modals />
    </div>
  );
};

const MenuWrapper = styled.div`
  ${tw`flex justify-end mr-4`}
`;
