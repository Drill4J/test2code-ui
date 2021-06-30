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
  Button, Icons, Menu, SessionIndicator,
} from "@drill4j/ui-kit";
import { AgentStatus } from "@drill4j/types-admin";
import { sendNotificationEvent } from "@drill4j/send-notification-event";
import {
  Link, matchPath, useHistory, useLocation,
} from "react-router-dom";
import tw, { styled } from "twin.macro";

import { AGENT_STATUS } from "common/constants";
import { useBuildVersion } from "hooks";
import { ActiveScope } from "types/active-scope";
import { getModalPath } from "common";
import { getAgentRoutePath } from "router";
import { toggleScope } from "../../api";
import { ScopeStatus } from "../scope-status";

interface MenuItemType {
  label: string;
  icon: keyof typeof Icons;
  onClick: () => void;
}

interface Props {
  isActiveBuild: boolean;
  status?: AgentStatus;
}

export const ScopeOverviewHeader = ({ status, isActiveBuild }: Props) => {
  const { push } = useHistory();
  const { pathname } = useLocation();
  const {
    params: {
      pluginId = "", scopeId = "", agentId = "",
    } = {},
  } = matchPath<{ pluginId: string, scopeId: string, agentId?: string; tab?: string; }>(pathname, {
    path: getAgentRoutePath("/scopes/:scopeId/:tab"),
  }) || {};
  const {
    name = "", active = false, enabled = false, started = 0, finished = 0,
  } = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`) || {};
  const menuActions = [
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
  const loading = false;

  return (
    <Header>
      <div
        className="text-ellipsis font-light text-24 leading-32 text-monochrome-black"
        data-test="scope-info:scope-name"
        title={name}
      >
        {name}
      </div>
      {status === AGENT_STATUS.ONLINE && (
        <div className="flex items-center w-full">
          {active && <SessionIndicator tw="mr-2" active={loading} />}
          <ScopeStatus active={active} loading={loading} enabled={enabled} started={started} finished={finished} />
        </div>
      )}
      <div className="flex justify-end items-center w-full">
        {active && status === AGENT_STATUS.ONLINE && (
          <Button
            className="flex gap-x-2 mr-4"
            primary
            size="large"
            onClick={() => push(getModalPath({ name: "finishScope" }))}
            data-test="scope-info:finish-scope-button"
          >
            <Icons.Complete />
            <span>Finish Scope</span>
          </Button>
        )}
        {isActiveBuild && status === AGENT_STATUS.ONLINE
        && <Menu items={menuActions as MenuItemType[]} />}
      </div>
    </Header>
  );
};

const Header = styled.div`
  ${tw`grid items-center gap-4 w-full h-20 border-b border-monochrome-medium-tint`}
  ${tw`text-24 text-monochrome-black`}
  grid-template-columns: minmax(auto, max-content) auto auto;
`;
