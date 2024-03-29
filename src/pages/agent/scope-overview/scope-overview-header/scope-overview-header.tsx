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
  Button, Icons, Menu, sendAlertEvent, SessionIndicator,
} from "@drill4j/ui-kit";
import { Link, useHistory } from "react-router-dom";
import { BuildStatus } from "@drill4j/types-admin";
import tw, { styled } from "twin.macro";

import { BUILD_STATUS } from "common/constants";
import {
  useActiveSessions, useAgentRouteParams, useFilteredData, useTestToCodeRouteParams,
} from "hooks";
import { ActiveScope } from "types/active-scope";
import { getModalPath } from "common";
import { PageHeader } from "components";
import { toggleScope } from "../../api";
import { ScopeStatus } from "../scope-status";

interface MenuItemType {
  label: string;
  icon: keyof typeof Icons;
  onClick: () => void;
}

interface Props {
  isActiveBuild: boolean;
  status?: BuildStatus;
}

export const ScopeOverviewHeader = ({ status, isActiveBuild }: Props) => {
  const { push } = useHistory();
  const { agentId } = useAgentRouteParams();
  const { buildVersion, scopeId } = useTestToCodeRouteParams();
  const activeSessionsQuantity = useActiveSessions("Agent", agentId, buildVersion)?.length;
  const {
    name = "", active = false, enabled = false, started = 0, finished = 0,
  } = useFilteredData<ActiveScope>(`/build/scopes/${scopeId}`) || {};
  const menuActions = [
    !active && {
      label: `${enabled ? "Ignore" : "Include"} in stats`,
      icon: enabled ? "EyeCrossed" : "Eye",
      onClick: () => toggleScope(agentId, {
        onSuccess: () => {
          sendAlertEvent({
            type: "SUCCESS",
            title: `Scope has been ${enabled ? "ignored" : "included"} in build stats.`,
          });
        },
        onError: () => {
          sendAlertEvent({
            type: "ERROR",
            title: "There is some issue with your action. Please try again later.",
          });
        },
      })(scopeId),
    },
    active && {
      label: "Sessions Management",
      icon: "ManageSessions",
      Content: ({ children }: { children: JSX.Element }) => (
        <Link to={getModalPath({ name: "sessionManagement" })}>
          {children}
        </Link>
      ),
    },
    {
      label: "Rename",
      icon: "Edit",
      onClick: () => push(getModalPath({ name: "renameScope", params: { scopeId } })),
    },
    {
      label: "Delete",
      icon: "Delete",
      onClick: () => push(getModalPath({ name: "deleteScope", params: { scopeId } })),
    },
  ].filter(Boolean);

  return (
    <Header>
      <div
        tw="text-ellipsis font-light text-24 leading-32 text-monochrome-black"
        data-test="scope-info:scope-name"
        title={name}
      >
        {name}
      </div>
      {status === BUILD_STATUS.ONLINE && (
        <div tw="flex items-center gap-x-2 w-full">
          {active && <SessionIndicator active={Boolean(activeSessionsQuantity)} />}
          <ScopeStatus active={active} loading={Boolean(activeSessionsQuantity)} enabled={enabled} started={started} finished={finished} />
        </div>
      )}
      <div tw="flex justify-end items-center w-full">
        {active && status === BUILD_STATUS.ONLINE && (
          <Button
            tw="flex gap-x-2 mr-4"
            primary
            size="large"
            onClick={() => push(getModalPath({ name: "finishScope", params: { scopeId } }))}
            data-test="scope-info:finish-scope-button"
          >
            <Icons.Complete />
            <span>Finish Scope</span>
          </Button>
        )}
        {isActiveBuild && status === BUILD_STATUS.ONLINE
        && <Menu items={menuActions as MenuItemType[]} />}
      </div>
    </Header>
  );
};

const Header = styled(PageHeader)`
  ${tw`grid items-center gap-4 w-full`}
  ${tw`text-24 text-monochrome-black`}
  grid-template-columns: minmax(auto, max-content) auto auto;
`;
