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
import { useParams, Link, useHistory } from "react-router-dom";
import {
  Menu, Icons, Status, Stub, Table,
} from "@drill4j/ui-kit";
import {
  percentFormatter, dateFormatter, timeFormatter, transformObjectsArrayToObject,
} from "@drill4j/common-utils";
import tw, { styled } from "twin.macro";

import { ScopeSummary } from "types/scope-summary";
import { TestTypeSummary } from "types/test-type-summary";
import { useActiveScope, useAgent, useBuildVersion } from "hooks";
import { AGENT_STATUS } from "common/constants";
import { sendNotificationEvent } from "@drill4j/send-notification-event";
import { getPagePath } from "common";
import { toggleScope } from "../api";
import { ScopeTimer } from "../scope-overview/scope-timer";

export const AllScopes = () => {
  const { pluginId = "", buildVersion = "", agentId = "" } = useParams<{ pluginId: string; buildVersion: string; agentId?: string; }>();
  const { push } = useHistory();
  const { buildVersion: activeBuildVersion = "", status } = useAgent(agentId) || {};
  const activeScope = useActiveScope();
  const scopes = useBuildVersion<ScopeSummary[]>("/build/scopes/finished") || [];
  scopes.sort(
    ({ started: firstStartedDate }, { started: secondStartedDate }) => secondStartedDate - firstStartedDate,
  );
  const scopesData = activeScope && activeScope.name ? [activeScope, ...scopes] : scopes;

  return (
    <div tw="flex flex-col w-full h-full">
      <Title>
        All Scopes
        <span tw="text-monochrome-default">{scopesData.length}</span>
      </Title>
      {scopesData.length > 0
        ? (
          <Table
            withSearchPanel={false}
            isDefaulToggleSortBy
            data={scopesData}
            columns={[
              {
                Header: "Name",
                accessor: "name",
                Cell: ({
                  value = "", row: {
                    original: {
                      id = "", started = 0, active = false, enabled = false, finished = 0,
                    } = {},
                  },
                }: any) => (
                  <Link
                    tw="font-bold text-14 leading-20 cursor-pointer"
                    to={getPagePath({ name: "scopeMethods", params: { scopeId: id } })}
                    data-test="scopes-list:scope-name"
                  >
                    <div className="link text-ellipsis" title={value}>{value}</div>
                    <div tw="flex gap-x-2 items-center w-full text-12">
                      <ScopeTimer started={started} finished={finished} active={active} size="small" />
                      {active && <Status tw="text-green-default">Active</Status>}
                      {!enabled && <Status tw="text-monochrome-default">Ignored</Status>}
                    </div>
                  </Link>
                ),
                textAlign: "left",
                width: "40%",
              },
              {
                Header: "Started",
                accessor: "started",
                Cell: ({ value = 0 }: any) => (
                  <>
                    <div tw="font-bold text-12 leading-16 text-monochrome-black">
                      {dateFormatter(value)}
                    </div>
                    <div tw="text-12 leading-20 text-monochrome-default">
                      at {timeFormatter(value)}
                    </div>
                  </>
                ),
                textAlign: "left",
                width: "15%",
              },
              {
                Header: "Coverage",
                accessor: "coverage",
                Cell: ({ row: { original = {} } = {} }: any) => (
                  <div tw="text-20 leading-32 my-6 text-monochrome-black" data-test="scopes-list:coverage">
                    {`${percentFormatter(original?.coverage?.percentage)}%`}
                  </div>
                ),
                width: "15%",
              },
              {
                Header: "Auto tests",
                accessor: "autoTests",
                Cell: ({ row: { original = {} } = {} }: any) => {
                  const coverageByTestType = transformObjectsArrayToObject(original?.coverage?.byTestType as TestTypeSummary[], "type");
                  return (
                    <div tw="font-bold text-12 leading-20 text-monochrome-black">
                      {coverageByTestType?.AUTO && (
                        <span>
                          {`${percentFormatter(coverageByTestType?.AUTO?.summary?.coverage?.percentage || 0)}%`}
                        </span>
                      )}
                      <div tw="font-regular text-right text-monochrome-default leading-16">
                        {coverageByTestType?.AUTO && coverageByTestType?.AUTO?.summary?.testCount}
                      </div>
                    </div>
                  );
                },
                width: "15%",
              },
              {
                Header: "Manual tests",
                accessor: "manualTests",
                Cell: ({ row: { original = {} } = {} }: any) => {
                  const coverageByTestType = transformObjectsArrayToObject(original?.coverage?.byTestType as TestTypeSummary[], "type");
                  return (
                    <div tw="font-bold text-12 leading-20 text-monochrome-black">
                      {coverageByTestType?.MANUAL && (
                        <span>
                          {`${percentFormatter(coverageByTestType?.MANUAL?.summary?.coverage?.percentage || 0)}%`}
                        </span>
                      )}
                      <div tw="font-regular text-right text-monochrome-default leading-16">
                        {coverageByTestType?.MANUAL && coverageByTestType?.MANUAL?.summary?.testCount}
                      </div>
                    </div>
                  );
                },
                width: "15%",
              },
              {
                Header: () => null,
                accessor: "actions",
                Cell: activeBuildVersion === buildVersion && status === AGENT_STATUS.ONLINE ? ({ row: { original = {} } = {} }: any) => {
                  const { active, enabled, id } = original;
                  const menuActions = [
                    active && {
                      label: "Finish Scope",
                      icon: "Check",
                      onClick: () => push(getPagePath({ name: "allScopePageFinishScopeModal", params: { scopeId: id } })),
                    },
                    active && {
                      label: "Sessions Management",
                      icon: "ManageSessions",
                      Content: ({ children }: { children: JSX.Element }) => (
                        <Link to={getPagePath({ name: "allScopePageSessionManagement", params: { scopeId: id } })}>
                          {children}
                        </Link>
                      ),
                    },
                    !active && {
                      label: `${enabled ? "Ignore" : "Include"} in stats`,
                      icon: enabled ? "EyeCrossed" : "Eye",
                      onClick: () => toggleScope(agentId, pluginId, {
                        onSuccess: () => {
                          sendNotificationEvent({
                            type: "SUCCESS",
                            text: `Scope has been ${enabled ? "ignored" : "included"} in build stats.`,
                          });
                        },
                        onError: () => {
                          sendNotificationEvent({
                            type: "ERROR",
                            text: "There is some issue with your action. Please try again later",
                          });
                        },
                      })(id),
                    },
                    {
                      label: "Rename",
                      icon: "Edit",
                      onClick: () => push(getPagePath({ name: "allScopePageRenameScopeModal", params: { scopeId: id } })),
                    },
                    {
                      label: "Delete",
                      icon: "Delete",
                      onClick: () => push(getPagePath({ name: "allScopePageDeleteScopeModal", params: { scopeId: id } })),
                    },
                  ].filter(Boolean);
                  return (
                    <div tw="flex justify-end">
                      <Menu items={menuActions} />
                    </div>
                  );
                } : () => null,
                width: "48px",
                notSortable: true,
              },
            ]}
          />
        ) : (
          <Stub
            icon={<Icons.Scope tw="text-monochrome-medium-tint" width={157} height={157} data-test="no-scope-stub:test-icon" />}
            title={<span tw="text-24">No scopes found</span>}
            message="There are no scopes with finished test sessions in this build."
          />
        )}
    </div>
  );
};

const Title = styled.div`
  ${tw`flex items-center gap-x-2 w-full h-20 border-b border-monochrome-medium-tint`}
  ${tw`font-light text-24 leading-32 text-monochrome-black`}
`;