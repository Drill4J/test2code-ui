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
import React, { useContext, useEffect } from "react";
import {
  Field, FormGroup, ContentAlert, Icons, Tooltip, Fields, Checkbox, useFormikContext,
} from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";
import { SetPanelContext } from "common";
import { useAdminConnection, useAgent } from "hooks";

interface Props {
  agentId: string;
  serviceGroupId: string;
  hasGlobalSession: boolean;
}

export const ManagementNewSession = ({
  agentId, serviceGroupId, hasGlobalSession,
}: Props) => {
  const { setErrors, setFieldError } = useFormikContext();
  useEffect(() => {
    setFieldError("sessionId", "");
    setErrors({});
  }, []);

  const setPanel = useContext(SetPanelContext);
  const agent = useAgent(agentId);
  const group = useAdminConnection(`/api/groups/${serviceGroupId}`) || {};

  return (
    <div>
      <ContentAlert tw="mx-6 mt-6" type="INFO">
        <span data-test="management-new-session:info-general-alert">
          Pay attention that you have to specify Header Mapping in&nbsp;
          {agentId
            ? (
              <SettingsLink
                tw="link"
                data-test="management-new-session:settings-link:agent"
                onClick={() => {
                  setPanel({
                    type: "SETTINGS",
                    payload: { ...agent, tab: "system" },
                  });
                }}
              >Agent Settings
              </SettingsLink>
            )
            : (
              <SettingsLink
                tw="link"
                data-test="management-new-session:settings-link:service-group"
                onClick={() => {
                  setPanel({
                    type: "SETTINGS",
                    payload: { ...Object(group), agentType: "Group", tab: "system" },
                  });
                }}
              >
                Service Group Settings
              </SettingsLink>
            )}
        </span>
      </ContentAlert>
      <div tw="grid gap-4 py-4 px-6">
        <FormGroup label="Session ID">
          <Field
            name="sessionId"
            placeholder="Enter session ID"
            component={Fields.Input}
          />
        </FormGroup>
        <Field
          name="isGlobal"
          type="checkbox"
        >
          {({ field }: any) => (
            <div tw="flex items-center gap-x-2">
              <Label disabled={hasGlobalSession}>
                <Checkbox
                  tw="text-blue-default"
                  field={field}
                />
                <span>Set as global session</span>
              </Label>
              <Tooltip
                message={(
                  <div tw="text-center">
                    {hasGlobalSession
                      ? (
                        <>
                          Only one active global session is allowed.
                          <br />
                          Please finish the active one in order to start new.
                        </>
                      )
                      : (
                        <>
                          Session that tracks all of the executions on your <br />
                          target application (e.g. background tasks)
                        </>
                      )}
                  </div>
                )}
              >
                <Icons.Info tw="text-monochrome-default" />
              </Tooltip>
            </div>
          )}
        </Field>
        <Field
          name="isRealtime"
          type="checkbox"
        >
          {({ field }: any) => (
            <div tw="flex items-center gap-x-2">
              <label tw="flex gap-x-2 items-center h-5 text-monochrome-black text-14">
                <Checkbox tw="text-blue-default" field={field} />
                <span>Real-time coverage collection</span>
              </label>
              <Tooltip
                message={(
                  <div tw="text-center">
                    Active scope coverage is updated once <br />
                    in 2 seconds. It will affect performance
                  </div>
                )}
              >
                <Icons.Info tw="text-monochrome-default" />
              </Tooltip>
            </div>
          )}
        </Field>
      </div>
    </div>
  );
};

const Label = styled.label<{disabled: boolean}>`
  ${tw`flex gap-x-2 items-center h-5 text-monochrome-black text-14`}
  ${({ disabled }) => disabled && tw`opacity-30 pointer-events-none`}
`;

const SettingsLink = styled.button`
  ${tw`font-bold`}
`;
