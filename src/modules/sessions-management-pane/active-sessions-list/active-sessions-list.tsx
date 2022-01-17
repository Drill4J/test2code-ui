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
import { ActiveSession } from "types/active-session";
import { Message } from "@drill4j/types-admin";
import { SessionInfo } from "./session-info";
import { ServiceGroupSessions } from "./service-group-sessions";
import "twin.macro";

interface Props {
  agentType: string;
  activeSessions: ActiveSession[];
  showGeneralAlertMessage: (message: Message) => void;
}

export const ActiveSessionsList = ({
  agentType, activeSessions, showGeneralAlertMessage,
}: Props) => (
<<<<<<< HEAD
  <div tw="overflow-y-auto flex-grow min-h-80px">
=======
  <div tw="flex-grow">
>>>>>>> d255d00 (feat: integrate new modal in get suggested tests modal)
    {agentType === "Agent" ? (
      <div tw="pt-3">
        {activeSessions.map(({
          id: sessionId, testType, agentId, isRealtime, isGlobal,
        }) => (
          <SessionInfo
            key={sessionId}
            sessionId={sessionId}
            agentId={agentId}
            testType={testType}
            isGlobal={isGlobal}
            isRealtime={isRealtime}
            showGeneralAlertMessage={showGeneralAlertMessage}
          />
        ))}
      </div>
    ) : (
      <ServiceGroupSessions activeSessions={activeSessions} showGeneralAlertMessage={showGeneralAlertMessage} />
    )}
  </div>
);
