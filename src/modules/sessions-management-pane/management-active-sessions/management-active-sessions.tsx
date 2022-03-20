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
import { Field, Fields, LinkButton } from "@drill4j/ui-kit";

import "twin.macro";

import { ActiveSession } from "types/active-session";
import { EVENT_LABELS, PLUGIN_EVENT_NAMES, sendPluginEvent } from "common/analytic";
import { useAgentRouteParams } from "hooks";
import { setBulkOperation, useSessionsPaneDispatch, useSessionsPaneState } from "../store";

interface Props {
  activeSessions: ActiveSession[];
}

export const ManagementActiveSessions = ({ activeSessions }: Props) => {
  const dispatch = useSessionsPaneDispatch();
  const { bulkOperation } = useSessionsPaneState();
  const disabled = bulkOperation.isProcessing;
  const { agentId } = useAgentRouteParams();

  return (
    <div
      tw="flex flex-col justify-between pt-4 px-6 pb-3 min-h-[88px] border-b
      border-monochrome-medium-tint text-16 leading-20 text-monochrome-black"
    >
      <div tw="flex justify-between items-center w-full">
        <span>
          Active Sessions
          <span tw="ml-2 text-monochrome-default">{activeSessions.length}</span>
        </span>
        <div tw="flex gap-4">
          <LinkButton
            size="small"
            onClick={() => {
              dispatch(setBulkOperation("abort", true));
              sendPluginEvent({
                name: PLUGIN_EVENT_NAMES.CLICK_ON_ABORT_ALL_SESSION_BUTTON,
                dimension2: agentId,
                label: EVENT_LABELS.SESSION_MANAGEMENT,
              });
            }}
            data-test="management-active-sessions:abort-all"
            disabled={disabled}
          >
            Abort all
          </LinkButton>
          <LinkButton
            size="small"
            onClick={() => {
              dispatch(setBulkOperation("finish", true));
              sendPluginEvent({
                name: PLUGIN_EVENT_NAMES.CLICK_ON_FINISH_ALL_SESSION_BUTTON,
                dimension2: agentId,
                label: EVENT_LABELS.SESSION_MANAGEMENT,
              });
            }}
            data-test="management-active-sessions:finish-all"
            disabled={disabled}
          >
            Finish all
          </LinkButton>
        </div>
      </div>
      <Field
        name="id"
        component={Fields.Search}
        placeholder="Search session by ID"
        disabled
      />
    </div>
  );
};
