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
import axios from "axios";
import {
  Button, Modal, GeneralAlerts, Spinner, Formik, Form, Field, Fields, Checkbox, composeValidators, sizeLimit, required, useCloseModal,
} from "@drill4j/ui-kit";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { useActiveSessions, useGroupData, useGroupRouteParams } from "hooks";
import { sendNotificationEvent } from "@drill4j/send-notification-event";
import { getGroupModalPath } from "common";
import { ScopeSummary, ServiceGroupSummary } from "types";
import { finishAllScopes } from "./finish-all-scopes";
import { renameScope } from "../../agent/api";

const validate = (formValues: {hasNewName: boolean}) => composeValidators(
  formValues.hasNewName ? required("scopesName") : () => undefined,
  formValues.hasNewName ? sizeLimit({
    name: "scopesName", alias: "Scopes Name", min: 1, max: 64,
  }) : () => undefined,
)(formValues);

export const FinishAllScopesModal = () => {
  const { groupId } = useGroupRouteParams();
  const { summaries: agentsSummaries = [] } = useGroupData<ServiceGroupSummary>("/group/summary", groupId) || {};
  const [errorMessage, setErrorMessage] = useState("");
  const activeSessions = useActiveSessions("ServiceGroup", groupId) || [];
  const [loading, setLoading] = useState(false);
  const closeModal = useCloseModal("/finish-all-scopes-modal");

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <div tw="text-ellipsis">Finish All Scopes</div>
        </Modal.Header>
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
        <Formik
          initialValues={{ hasNewName: false, ignoreScope: false, scopesName: "" }}
          validate={validate}
          onSubmit={async ({ hasNewName, ignoreScope, scopesName = "" }: any) => {
            setLoading(true);
            let hasError = false;
            if (hasNewName) {
              try {
                const scopes = await Promise.allSettled(agentsSummaries.map(({ id = "", buildVersion }): Promise<ScopeSummary> => axios
                  .get(`/plugins/test2code/active-scope?agentId=${id}&buildVersion=${buildVersion}&type=AGENT`)));

                const scopesIds = scopes?.map(({ value: { data: { id = "" } = {} } = {} }: any) => id);

                await Promise.allSettled(agentsSummaries.map(({ id: agentId = "" }, i) =>
                  renameScope(agentId, "test2code",
                    {
                      onError: (msg: string) => {
                        setErrorMessage(msg);
                        hasError = true;
                      },
                    })({ id: scopesIds[i], name: scopesName } as ScopeSummary)));
              } catch (e) {
                setErrorMessage(e.message || "Rename scopes failed");
                hasError = true;
              }
            }
            if (!hasError) {
              await finishAllScopes(groupId, {
                onSuccess: () => {
                  sendNotificationEvent({
                    type: "SUCCESS",
                    text: "All scopes have been successfully finished",
                  });
                  closeModal();
                },
                onError: setErrorMessage,
              })({ prevScopeEnabled: !ignoreScope, savePrevScope: true });
            }
            setLoading(false);
          }}
        >
          {({ values: { hasNewName }, isValid }) => (
            <Form>
              <Modal.Body tw="text-14 leading-24">
                <span>
                  You are about to finish active scopes of all
                  {` ${agentsSummaries.length} `}
                  service group agents.
                </span>
                <Instructions>
                  <div>All gathered data will be added to build stats</div>
                  <div>Empty scopes will be deleted</div>
                  <div>New scopes will be started automatically</div>
                </Instructions>
                <label tw="flex items-center gap-x-2 my-2 text-blue-default">
                  <Field
                    type="checkbox"
                    name="ignoreScope"
                  >
                    {({ field }: any) => (<Checkbox field={field} />)}
                  </Field>
                  <span tw="text-monochrome-black">Ignore all scopes in build stats</span>
                </label>
                <label tw="flex items-center gap-x-2 my-2 text-blue-default">
                  <Field
                    type="checkbox"
                    name="hasNewName"
                  >
                    {({ field }: any) => (<Checkbox field={field} />)}
                  </Field>
                  <span tw="text-monochrome-black">Rename all scopes</span>
                </label>
                <Field
                  name="scopesName"
                  placeholder="Enter new scopes name"
                  component={Fields.Input}
                  disabled={!hasNewName || loading}
                />
              </Modal.Body>
              <Modal.Footer tw="flex items-center">
                <Button
                  tw="flex justify-center items-center gap-x-1 w-36 h-8 mr-4 px-4 text-14 font-bold"
                  primary
                  disabled={activeSessions.length > 0 || loading || !isValid}
                  type="submit"
                  data-test="finish-all-scopes-modal:submit-button"
                >
                  {loading ? <Spinner /> : "Finish all scopes"}
                </Button>
                <Button secondary size="large" type="button" onClick={() => closeModal()}>
                  Cancel
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Content>
    </Modal>
  );
};

const Instructions = styled.div`
  ${tw`mt-2`}
  & > *::before {
    ${tw`mx-4`}
    content: '\\2022';
  }
`;
