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
import React, { useEffect, useState } from "react";
import { sendAlertEvent } from "@drill4j/ui-kit";
import { matchPath, useLocation } from "react-router-dom";
import { createStore, WritableStore } from "nanostores";
import { useActiveSessions } from "../../hooks";
import { agentPluginPath, groupPluginPath } from "../../router";
import { ActiveSession } from "../../types/active-session";

export const sessionsStore: WritableStore = createStore();

export const SessionsWatcher = () => {
  const [session, setSession] = useState<ActiveSession[] | null>(null);
  const { pathname } = useLocation();
  const {
    params: {
      agentId = "", groupId = "", buildVersion = "",
    } = {},
  } = matchPath<{ agentId: string; groupId: string; buildVersion: string}>(pathname, {
    path: [agentPluginPath, groupPluginPath],
  }) || {};
  const agentType = groupId ? "ServiceGroup" : "Agent";
  const id = agentId || groupId;
  const activeSessions = useActiveSessions(agentType, id, buildVersion) || [];

  useEffect(() => {
    setSession(activeSessions);
    sessionsStore.set(activeSessions);
  }, []);
  return (
    <>
      {session && <NewSessionAlert activeSessions={activeSessions} />}
    </>
  );
};

const NewSessionAlert = ({ activeSessions }: {activeSessions: ActiveSession[]}) => null;
