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
import { LinkButton, Fields, Field } from "@drill4j/ui-kit";

import tw, { styled } from "twin.macro";

import { ActiveSession } from "types/active-session";
import { useSessionsPaneDispatch, useSessionsPaneState, setBulkOperation } from "../store";

interface Props {
  activeSessions: ActiveSession[];
}

const Content = styled.div`
  min-height: 88px;
  ${tw`border-b border-monochrome-medium-tint text-16 leading-20 text-monochrome-black`}
`;

export const ManagementActiveSessions = ({ activeSessions }: Props) => {
  const dispatch = useSessionsPaneDispatch();
  const { bulkOperation } = useSessionsPaneState();
  const disabled = bulkOperation.isProcessing;

  return (
    <Content
      data-test="management-active-sessions:search-panel"
    >
      <div tw="flex flex-col justify-between pt-4 px-6 pb-3 h-full">
        <div tw="flex justify-between items-center w-full">
          <span>
            Active Sessions
            <span tw="ml-2 text-monochrome-default">{activeSessions.length}</span>
          </span>
          <div tw="flex gap-4">
            <LinkButton
              size="small"
              onClick={() => dispatch(setBulkOperation("abort", true))}
              data-test="management-active-sessions:abort-all"
              disabled={disabled}
            >
              Abort all
            </LinkButton>
            <LinkButton
              size="small"
              onClick={() => dispatch(setBulkOperation("finish", true))}
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
    </Content>
  );
};
