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
import { Icons, Menu } from "@drill4j/ui-kit";
import { capitalize } from "@drill4j/common-utils";
import tw, { styled } from "twin.macro";
import { useStore } from "nanostores/react";

import { useSessionsPaneState } from "../../store";
import { abortSession, finishSession } from "../../sessions-management-pane-api";
import { sessionsStore } from "../../../new-session-watcher/new-session-watcher";

interface Props {
  testType: string;
  isGlobal: boolean;
  isRealtime: boolean;
  sessionId: string;
  agentId: string;
}

const AdditionalSessionInfo = styled.div`
  ${tw`flex mt-1 gap-2 `}
  ${tw`text-monochrome-default`}
`;

const SessionId = styled.div`
  ${tw`text-14 leading-24 text-ellipsis`}
`;

const Content = styled.div<{disabled?: boolean}>`
  ${tw`h-14 pt-1 pb-2 px-6 text-12 leading-16 text-monochrome-black`}
  ${({ disabled }) => disabled && tw`opacity-20`}
`;

const Actions = styled.div<{disabled?: boolean}>`
  ${tw`mr-1`}
  ${({ disabled }) => disabled && tw`pointer-events-none`}
`;

export const SessionInfo = ({
  testType, isGlobal, isRealtime, sessionId, agentId,
}: Props) => {
  const { bulkOperation } = useSessionsPaneState();
  const disabled = bulkOperation.isProcessing;
  const store = useStore(sessionsStore);

  return (
    <Content disabled={disabled}>
      <div className="flex justify-between items-center gap-x-2 w-full">
        <SessionId data-test="session-info:session-id" title={sessionId}>{sessionId}</SessionId>
        <Actions disabled={disabled}>
          <Menu
            items={[
              { label: "Finish", icon: "Success", onClick: () => finishSession(agentId, sessionId, store) },
              { label: "Abort", icon: "Cancel", onClick: () => abortSession(agentId, sessionId, store) },
            ]}
          />
        </Actions>
      </div>
      <AdditionalSessionInfo>
        {isGlobal
          ? <div tw="flex"><Icons.Global />&nbsp;Global</div>
          : <span tw="text-12 leading-16 text-monochrome-default" data-test="session-info:test-type">{capitalize(testType)}</span>}
        {isRealtime && <div tw="flex"><Icons.RealTime />&nbsp;Real-time</div>}
      </AdditionalSessionInfo>
    </Content>
  );
};
