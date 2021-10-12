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
import {
  Button, Popup, GeneralAlerts, Spinner,
} from "@drill4j/ui-kit";
import { useCloseModal } from "@drill4j/common-hooks";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { useActiveSessions, useGroupRouteParams } from "hooks";
import { sendNotificationEvent } from "@drill4j/send-notification-event";
import { getGroupModalPath } from "common";
import { finishAllScopes } from "./finish-all-scopes";

interface Props {
  agentsCount: number;
}

const Instructions = styled.div`
  ${tw`mt-2`}
  & > *::before {
    ${tw`mx-4`}
    content: '\\2022';
  }
`;

export const FinishAllScopesModal = ({ agentsCount }: Props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const { groupId = "" } = useGroupRouteParams();
  const activeSessions = useActiveSessions("ServiceGroup", groupId) || [];
  const [loading, setLoading] = useState(false);
  const closeModal = useCloseModal("/finish-all-scopes-modal");

  return (
    <Popup
      isOpen
      onToggle={closeModal}
      header={<div tw="text-ellipsis">Finish All Scopes</div>}
      type="info"
      closeOnFadeClick
    >
      <div tw="w-108">
        {errorMessage && (
          <GeneralAlerts type="ERROR">
            {errorMessage}
          </GeneralAlerts>
        )}
        {activeSessions.length > 0 && (
          <GeneralAlerts type="WARNING">
            <div>
              At least one active session has been detected.<br />
              First, you need to finish it in&nbsp;
              <Link
                to={getGroupModalPath({ name: "sessionManagement" })}
                tw="link text-14"
              >
                Sessions Management
              </Link>
            </div>
          </GeneralAlerts>
        )}
        <div tw="mt-4 mx-6 mb-6 text-14 leading-24">
          <span>
            You are about to finish active scopes of all
            {` ${agentsCount} `}
            service group agents.
          </span>
          <Instructions>
            <div>All gathered data will be added to build stats</div>
            <div>Empty scopes will be deleted</div>
            <div>New scopes will be started automatically</div>
          </Instructions>
          <div className="flex items-center w-full mt-6">
            <Button
              tw="flex justify-center items-center gap-x-1 w-36 h-8 mr-4 px-4 text-14 font-bold"
              primary
              disabled={activeSessions.length > 0 || loading}
              onClick={async () => {
                setLoading(true);
                await finishAllScopes(groupId, {
                  onSuccess: () => {
                    sendNotificationEvent({
                      type: "SUCCESS",
                      text: "All scopes have been successfully finished",
                    });
                    closeModal();
                  },
                  onError: setErrorMessage,
                })({ prevScopeEnabled: true, savePrevScope: true });
                setLoading(false);
              }}
            >
              {loading ? <Spinner /> : "Finish all scopes"}
            </Button>
            <Button secondary size="large" onClick={() => closeModal()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Popup>
  );
};
