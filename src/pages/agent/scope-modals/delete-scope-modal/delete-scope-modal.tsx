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
  Button, Modal, Spinner, useCloseModal, sendAlertEvent, useQueryParams,
} from "@drill4j/ui-kit";
import { useHistory, Link } from "react-router-dom";

import "twin.macro";

import { ActiveScope } from "types/active-scope";
import {
  useAgentRouteParams, useBuildVersion, useNavigation, useTestToCodeRouteParams,
} from "hooks";
import { ActiveSessions } from "types/active-sessions";
import { getModalPath } from "common";
import { deleteScope } from "../../api";

export const DeleteScopeModal = () => {
  const { agentId = "", pluginId = "" } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { getPagePath } = useNavigation();
  const { scopeId } = useQueryParams<{scopeId?: string;}>();
  const scope = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`);
  const { push, location: { pathname = "" } } = useHistory();
  const [loading, setLoading] = useState(false);
  const { testTypes = [] } = useBuildVersion<ActiveSessions>("/active-scope/summary/active-sessions") || {};
  const closeModal = useCloseModal("/delete-scope-modal", ["scopeId"]);

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <div tw="w-97 text-ellipsis">
            {`Delete Scope ${scope?.name}`}
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="text-14 leading-20">
            {scope && scope.active && !testTypes.length && (
              <span>
                You are about to delete an active scope. Are you sure you <br />
                want to proceed? All scope data will be lost.
              </span>
            )}
            {scope && scope.active && Boolean(testTypes.length) && (
              <span>
                You are about to delete an active scope, but at least one active<br />
                session has been detected. First, you need to finish it in <br />
                <Link
                  to={getModalPath({ name: "sessionManagement" })}
                  tw="link font-bold text-14"
                  onClick={() => {}}
                >
                  Sessions Management
                </Link>
              </span>
            )}
            { scope && !scope.active && (
              <span>
                You are about to delete a non-empty scope. Are you sure you want
                to proceed? All scope data will be lost.
              </span>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer tw="flex items-center gap-x-4">
          {scope && scope.active && Boolean(testTypes.length)
            ? (
              <Button
                onClick={closeModal}
                secondary
                size="large"
              >
                Ok, got it
              </Button>
            )
            : (
              <>
                <Button
                  className="flex justify-center items-center gap-x-1 px-4 w-43 h-8 text-14"
                  primary
                  disabled={!scope || loading}
                  onClick={async () => {
                    setLoading(true);
                    await deleteScope(agentId, pluginId, {
                      onSuccess: () => {
                        sendAlertEvent({ type: "SUCCESS", title: "Scope has been deleted" });
                        closeModal();
                        scope?.id && pathname.includes(scope.id)
                        && push(getPagePath({ name: "overview", params: { buildVersion }, queryParams: { activeTab: "methods" } }));
                      },
                      onError: message => sendAlertEvent({ type: "ERROR", title: message }),
                    })(scope as ActiveScope);
                    setLoading(false);
                  }}
                  data-test="delete-scope-modal:confirm-delete-button"
                >
                  {loading ? <Spinner /> : "Yes, Delete Scope"}
                </Button>
                <Button
                  secondary
                  size="large"
                  onClick={closeModal}
                  data-test="delete-scope-modal:cancel-modal-button"
                >
                  Cancel
                </Button>
              </>
            )}
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
