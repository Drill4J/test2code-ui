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
import React, { useState } from "react";
import { sendAlertEvent } from "@drill4j/ui-kit";
import { matchPath, useLocation } from "react-router-dom";
import { createStore, WritableStore } from "nanostores";
import { useActiveSessions } from "../../hooks";
import { agentPluginPath, groupPluginPath } from "../../router";
import { ActiveSession } from "../../types/active-session";

export const sessionsStore: WritableStore = createStore<string[]>(() => sessionsStore.set([]));

export const SessionsWatcher = () => {
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
  const activeSessions = useActiveSessions(agentType, id, buildVersion);

  return (
    <>
      {activeSessions && <NewSessionAlert activeSessions={activeSessions} />}
    </>
  );
};

const NewSessionAlert = React.memo(({ activeSessions }: {activeSessions: ActiveSession[]}) => {
  // first sync active session with session store
  useState(() => {
    sessionsStore.set(activeSessions.map(sessionValue => sessionValue.id));
  });

  if (activeSessions.length === sessionsStore.value.length) return null;

  let diffCount: number;
  let type: string;

  if (activeSessions.length > sessionsStore.value.length) {
    type = "started";
    diffCount = activeSessions.filter(session => !sessionsStore.value.includes(session.id)).length;
  } else {
    const mapActiveSessions = activeSessions.map(session => session.id);
    type = "finished/aborted";
    diffCount = sessionsStore.value.filter((id: string) => !mapActiveSessions.includes(id)).length;
  }
  sendAlertEvent({ type: "INFO", title: `${diffCount > 1 ? `(${diffCount}) Sessions` : "Session"} have been ${type}` });

  sessionsStore.set(activeSessions.map(sessionValue => sessionValue.id));

  return null;
});
