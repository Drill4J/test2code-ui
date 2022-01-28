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
  Button, Icons, Modal, GeneralAlerts, Spinner, Formik, Form, Checkbox, Field, useCloseModal, sendAlertEvent,
} from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import { ActiveScope } from "types/active-scope";
import { ActiveSessions } from "types/active-sessions";
import { useAgentRouteParams, useBuildVersion, useTestToCodeRouteParams } from "hooks";
import { getModalPath, getPagePath } from "common";
import { finishScope } from "../../api";
import { ScopeSummary } from "./scope-summary";

export const FinishScopeModal = () => {
  const { scopeId, buildVersion } = useTestToCodeRouteParams();
  const scope = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`);
  const {
    agentId = "", pluginId = "",
  } = useAgentRouteParams();
  const { testTypes: activeSessionTest = [] } = useBuildVersion<ActiveSessions>("/active-scope/summary/active-sessions") || {};
  const [loading, setLoading] = useState(false);
  const testsCount = scope
    ? (scope.coverage.byTestType || []).reduce((acc, { summary: { testCount = 0 } }) => acc + testCount, 0)
    : 0;
  const { push, location: { pathname = "" } } = useHistory();
  const isScopeInfoPage = scope?.id && pathname.includes(scope.id);
  const closeModal = useCloseModal("/finish-scope-modal", ["scopeId"]);

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <div tw="w-98">
            <div tw="text-ellipsis" data-test="finish-scope-modal:header">{`Finish Scope ${scope && scope.name}`}</div>
          </div>
        </Modal.Header>
        {activeSessionTest.length > 0 && (
          <GeneralAlerts type="WARNING">
            <div>
              At least one active session has been detected.<br />
              First, you need to finish it in&nbsp;
              <Link
                data-test="finish-scope-modal:general-alert:session-management-link"
                tw="link font-bold text-14"
                to={getModalPath({ name: "sessionManagement" })}
              >
                Sessions Management
              </Link>
            </div>
          </GeneralAlerts>
        )}
        {Boolean(!testsCount && !activeSessionTest.length) && (
          <GeneralAlerts type="WARNING">
            Scope is empty and will be deleted after finishing.
          </GeneralAlerts>
        )}
        <Formik
          initialValues={{ ignoreScope: false, forceFinish: false }}
          onSubmit={async ({ ignoreScope, forceFinish }: any) => {
            setLoading(true);
            await finishScope(agentId, pluginId, {
              onSuccess: () => {
                sendAlertEvent({
                  type: "SUCCESS",
                  title: scope?.coverage.percentage
                    ? "Scope has been finished"
                    : "Scope has been finished and deleted",
                });
                closeModal();
              },
              onError: message => sendAlertEvent({ type: "ERROR", title: message }),
            })({ prevScopeEnabled: !ignoreScope, savePrevScope: true, forceFinish });
            if (isScopeInfoPage &&
              ((forceFinish && !scope?.coverage.percentage) || (!forceFinish && !scope?.sessionsFinished))) {
              push(getPagePath({ name: "overview", params: { buildVersion }, queryParams: { activeTab: "methods" } }));
            }
            setLoading(false);
          }}
        >
          {({ values: { forceFinish } }) => {
            const finishScopeButtonContent = getFinishScopeButtonContent({
              loading, hasTests: Boolean(testsCount), hasActiveSessions: Boolean(activeSessionTest.length), forceFinish,
            });
            return (
              <Form tw="flex flex-col">
                <Modal.Body>
                  <ScopeSummary scope={scope as ActiveScope} testsCount={testsCount} />
                  <div tw="flex flex-col gap-y-4 mt-6 text-14 leading-20 text-blue-default">
                    {Boolean(activeSessionTest.length) && (
                      <div>
                        <Label disabled={false}>
                          <Field
                            type="checkbox"
                            name="forceFinish"
                          >
                            {({ field }: any) => (<Checkbox field={field} />)}
                          </Field>
                          <span tw="text-monochrome-black">Delete active sessions and finish scope anyway</span>
                        </Label>
                        {forceFinish && scope && !scope.coverage.percentage && (
                          <div tw="flex gap-x-2 items-center mt-2 ml-6 text-orange-default font-regular">
                            <Icons.Warning /> Scope is empty and will be deleted after finishing
                          </div>
                        )}
                      </div>
                    )}
                    <Label disabled={((!testsCount || activeSessionTest.length > 0) && !forceFinish) || !scope?.coverage.percentage}>
                      <Field
                        type="checkbox"
                        name="ignoreScope"
                      >
                        {({ field }: any) => (<Checkbox field={field} />)}
                      </Field>
                      <span tw="text-monochrome-black">Ignore scope in build stats</span>
                    </Label>
                  </div>
                </Modal.Body>
                <Modal.Footer tw="flex items-center gap-x-4">
                  <Button
                    className={`flex justify-center items-center gap-x-1 ${finishScopeButtonContent === "Finish Scope" ? "w-30" : "w-40"}`}
                    primary
                    size="large"
                    disabled={loading || (Boolean(activeSessionTest.length) && !forceFinish)}
                    type="submit"
                    data-test="finish-scope-modal:finish-scope-button"
                  >
                    {finishScopeButtonContent}
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
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal.Content>
    </Modal>
  );
};

const Label = styled.label<{disabled: boolean}>`
  ${tw`flex items-center gap-x-2`}
  ${({ disabled }) => disabled && tw`pointer-events-none opacity-30`}
`;

function getFinishScopeButtonContent({
  loading, hasTests, hasActiveSessions, forceFinish,
}: any): React.ReactNode {
  if (loading) {
    return <Spinner />;
  }

  if (hasTests) {
    return "Finish Scope";
  }

  if (!hasTests && hasActiveSessions && !forceFinish) {
    return "Finish Scope";
  }

  if (!hasTests) {
    return "Finish and Delete";
  }

  return "Finish Scope";
}
