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
import { useHistory, Link } from "react-router-dom";
import {
  Button, Inputs, Popup, GeneralAlerts, Spinner,
} from "@drill4j/ui-kit";
import { sendNotificationEvent } from "@drill4j/send-notification-event";
import { useCloseModal } from "@drill4j/common-hooks";
import tw, { styled } from "twin.macro";

import { ActiveScope } from "types/active-scope";
import { ActiveSessions } from "types/active-sessions";
import { useAgentRouteParams, useBuildVersion } from "hooks";
import { getModalPath } from "common";
import { finishScope } from "../../api";
import { ScopeSummary } from "./scope-summary";

export const FinishScopeModal = () => {
  const scope = useBuildVersion<ActiveScope>("/active-scope");
  const {
    agentId = "", buildVersion = "", pluginId = "",
  } = useAgentRouteParams();
  const { testTypes = [] } = useBuildVersion<ActiveSessions>("/active-scope/summary/active-sessions") || {};
  const [errorMessage, setErrorMessage] = useState("");
  const [ignoreScope, setIgnoreScope] = useState(false);
  const [loading, setLoading] = useState(false);
  const testsCount = scope
    ? (scope.coverage.byTestType || []).reduce((acc, { summary: { testCount = 0 } }) => acc + testCount, 0)
    : 0;
  const { push, location: { pathname = "" } } = useHistory();
  const isScopeInfoPage = scope?.id && pathname.includes(scope.id);
  const closeModal = useCloseModal("/finish-scope-modal");

  return (
    <Popup
      isOpen
      onToggle={closeModal}
      header={(
        <div tw="w-98">
          <div tw="text-ellipsis" data-test="finish-scope-modal:header">{`Finish Scope ${scope && scope.name}`}</div>
        </div>
      )}
      type="info"
      closeOnFadeClick
    >
      <div tw="w-108">
        {errorMessage && (
          <GeneralAlerts type="ERROR">
            {errorMessage}
          </GeneralAlerts>
        )}
        {testTypes.length > 0 && (
          <GeneralAlerts type="WARNING">
            <div>
              At least one active session has been detected.<br />
              First, you need to finish it in&nbsp;
              <Link
                tw="link font-bold text-14"
                to={getModalPath({ name: "sessionManagement" })}
              >
                Sessions Management
              </Link>
            </div>
          </GeneralAlerts>
        )}
        {Boolean(!testsCount && !testTypes.length) && (
          <GeneralAlerts type="WARNING">
            Scope is empty and will be deleted after finishing.
          </GeneralAlerts>
        )}
        <div tw="m-6">
          <ScopeSummary scope={scope as ActiveScope} testsCount={testsCount} />
          <div tw="mt-6 mb-9">
            <Label
              onClick={() => setIgnoreScope(!ignoreScope)}
              disabled={!testsCount || testTypes.length > 0}
            >
              <Inputs.Checkbox
                tw="text-blue-default"
                checked={ignoreScope}
              />
              <span tw="text-14 leading-20">Ignore scope in build stats</span>
            </Label>
          </div>
          <div className="flex items-center gap-x-4 w-full mt-9">
            {!testTypes.length ? (
              <>
                <Button
                  className={`flex justify-center items-center gap-x-1 ${testsCount ? "w-30" : "w-40"}`}
                  primary
                  size="large"
                  disabled={testTypes.length > 0 || loading}
                  onClick={async () => {
                    setLoading(true);
                    await finishScope(agentId, pluginId, {
                      onSuccess: () => {
                        sendNotificationEvent({ type: "SUCCESS", text: "Scope has been finished" });
                        closeModal();
                      },
                      onError: setErrorMessage,
                    })({ prevScopeEnabled: !ignoreScope, savePrevScope: true });
                    isScopeInfoPage && !scope?.sessionsFinished &&
                        push(`/full-page/${agentId}/${buildVersion}/${pluginId}/dashboard/methods`);
                    setLoading(false);
                  }}
                  data-test="finish-scope-modal:finish-scope-button"
                >
                  {loading && <Spinner disabled />}
                  {!loading && Boolean(testsCount) && "Finish Scope" }
                  {!loading && !testsCount && "Finish and Delete" }
                </Button>
                <Button
                  secondary
                  size="large"
                  onClick={closeModal}
                  disabled={loading}
                  data-test="finish-scope-modal:cancel-modal-button"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                secondary
                size="large"
                onClick={closeModal}
                data-test="finish-scope-modal:cancel-modal-button"
              >
                Ok, got it
              </Button>
            )}
          </div>
        </div>
      </div>
    </Popup>
  );
};

const Label = styled.label<{disabled: boolean}>`
  ${tw`flex items-center gap-x-2`}
  ${({ disabled }) => disabled && tw`pointer-events-none opacity-30`}
`;
