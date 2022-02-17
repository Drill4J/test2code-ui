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
  Form, Formik, Panel, Icons, composeValidators, sizeLimit,
  required, handleFieldErrors, Stub, useCloseModal, sendAlertEvent,
} from "@drill4j/ui-kit";
import { matchPath, useLocation } from "react-router-dom";
import "twin.macro";

import {
  useActiveSessions, useAgentRouteParams, useGroupRouteParams, useTestToCodeRouteParams,
} from "hooks";
import { agentPluginPath, groupPluginPath } from "admin-routes";
import { ManagementNewSession } from "./management-new-session";
import {
  startServiceGroupSessions, startAgentSession,
} from "./sessions-management-pane-api";
import { ManagementActiveSessions } from "./management-active-sessions";
import { ActiveSessionsList } from "./active-sessions-list";
import { BulkOperationWarning } from "./bulk-operation-warning";
import { ActionsPanel } from "./actions-panel";
import { setIsNewSession, useSessionsPaneDispatch, useSessionsPaneState } from "./store";

interface FormValues {
  sessionId: string;
  isRealtime: boolean;
  isGlobal: boolean
}

const validateManageSessionsPane = composeValidators(
  required("sessionId", "Session ID"),
  sizeLimit({
    name: "sessionId", alias: "Session ID", min: 1, max: 256,
  }),
);

export const SessionsManagementPane = () => {
  const dispatch = useSessionsPaneDispatch();
  const { bulkOperation, isNewSession } = useSessionsPaneState();
  const { buildVersion } = useTestToCodeRouteParams();
  const { agentId } = useAgentRouteParams();
  const { groupId } = useGroupRouteParams();
  const agentType = groupId ? "ServiceGroup" : "Agent";
  const id = agentId || groupId;
  const activeSessions = useActiveSessions(agentType, id, buildVersion) || [];
  const hasGlobalSession = activeSessions.some(({ isGlobal }) => isGlobal);
  const closePanel = useCloseModal("/session-management");

  return (
    <Panel onClose={closePanel}>
      <Panel.Content>
        <Formik
          initialValues={{}}
          onSubmit={(async (values: {sessionId: string; isRealtime: boolean; isGlobal: boolean},
            { resetForm, setFieldError }: any) => {
            const error = agentId
              ? await handleStartAgentSession({ id: agentId }, values)
              : await handleStartServiceGroupSession({ id: groupId }, values);
            if (error.sessionId) {
              setFieldError("sessionId", error.sessionId);
            } else {
              resetForm();
              dispatch(setIsNewSession(false));
            }
          }) as any}
          validate={validateManageSessionsPane}
        >
          {({
            handleSubmit, isSubmitting, isValid,
          }) => (
            <Form tw="flex flex-col h-full">
              <Panel.Header
                tw="text-20 leading-32 text-monochrome-black"
                data-test="sessions-management-pane:header"
              >
                {isNewSession ? "Start New Session" : "Sessions Management"}
              </Panel.Header>
              {/* HACK: use min-width use min-width so that the text does not stretch outside the block
                Link: https://css-tricks.com/flexbox-truncated-text/ */}
              <Panel.Body tw="text-16 leading-20 flex flex-col min-h-80px">
                {isNewSession && (
                  <ManagementNewSession
                    agentId={agentId}
                    serviceGroupId={groupId}
                    hasGlobalSession={hasGlobalSession}
                  />
                )}
                {!isNewSession && activeSessions.length > 0 && (
                  <>
                    <ManagementActiveSessions activeSessions={activeSessions} />
                    <ActiveSessionsList
                      agentType={agentType}
                      activeSessions={activeSessions}
                    />
                  </>
                )}
                {!isNewSession && activeSessions.length === 0 && (
                  <Stub
                    icon={(
                      <Icons.Test
                        width={120}
                        height={134}
                        viewBox="0 0 18 20"
                        data-test="empty-active-sessions-stub:test-icon"
                      />
                    )}
                    title="There are no active sessions"
                    message="You can use this menu to start a new one."
                  />
                )}
              </Panel.Body>
              <Panel.Footer>
                {bulkOperation.isProcessing ? (
                  <BulkOperationWarning
                    agentId={id}
                    agentType={agentType}
                  />
                ) : (
                  <ActionsPanel
                    activeSessions={activeSessions}
                    startSessionDisabled={!isValid || isSubmitting}
                    onToggle={closePanel}
                    handleSubmit={handleSubmit}
                    submitting={isSubmitting}
                  />
                )}
              </Panel.Footer>
            </Form>
          )}
        </Formik>
      </Panel.Content>
    </Panel>
  );
};

interface Identifiers {
  id: string;
}

async function handleStartServiceGroupSession({ id }: Identifiers,
  values: FormValues) {
  try {
    const response = await startServiceGroupSessions(id)(values);
    const serviceWithError = response?.data.find((service: any) => service?.code === 409);
    if (serviceWithError && serviceWithError?.data?.fieldErrors) {
      return handleFieldErrors(serviceWithError?.data?.fieldErrors);
    }
    if (serviceWithError) {
      sendAlertEvent({
        type: "ERROR",
        title: serviceWithError?.data?.message || "There is some issue with your action. Please try again later.",
      });
      return handleFieldErrors([]);
    }
    sendAlertEvent({ type: "SUCCESS", title: "New sessions have been started successfully." });
  } catch (error) {
    sendAlertEvent({
      type: "ERROR",
      title: error?.response?.data?.message || "There is some issue with your action. Please try again  later.",
    });
  }
  return handleFieldErrors([]);
}

async function handleStartAgentSession({ id }: Identifiers,
  values: FormValues) {
  try {
    await startAgentSession(id)(values);
    sendAlertEvent({ type: "SUCCESS", title: "New session has been started successfully." });
  } catch (error) {
    const { data: { fieldErrors = [] } = {}, message: errorMessage = "" } = error?.response?.data || {};
    if (error?.response?.data?.code === 409) {
      return handleFieldErrors(fieldErrors);
    }
    sendAlertEvent({
      type: "ERROR",
      title: errorMessage || "There is some issue with your action. Please try again later.",
    });
    return handleFieldErrors(fieldErrors);
  }
  return handleFieldErrors([]);
}
