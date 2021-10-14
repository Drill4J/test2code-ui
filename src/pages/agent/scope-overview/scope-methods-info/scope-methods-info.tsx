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
import { TableActionsProvider } from "@drill4j/ui-kit";
import "twin.macro";

import { BuildMethodsCard } from "components";
import { Methods } from "types/methods";
import { ActiveScope } from "types/active-scope";
import {
  useActiveSessions, useTestToCodeParams, useAgentParams, useBuildVersion,
} from "hooks";
import { ScopeCoverageInfo } from "../scope-coverage-info";
import { MethodsTable } from "../../methods-table";

export const ScopeMethodsInfo = () => {
  const { agentId } = useAgentParams();
  const { scopeId, buildVersion } = useTestToCodeParams();
  const scope = useBuildVersion<ActiveScope>(`/build/scopes/${scopeId}`);
  const {
    all, new: newMethods, modified,
  } = useBuildVersion<Methods>(`/build/scopes/${scope?.id}/methods`) || {};
  const activeSessions = useActiveSessions("Agent", agentId, buildVersion) || [];

  return (
    <>
      <div tw="flex flex-col gap-10">
        <ScopeCoverageInfo scope={scope} />
        <div tw="flex gap-2">
          <BuildMethodsCard
            totalCount={all?.total}
            covered={all?.covered}
            label="TOTAL METHODS"
          />
          <BuildMethodsCard
            totalCount={newMethods?.total}
            covered={newMethods?.covered}
            label="NEW"
          />
          <BuildMethodsCard
            totalCount={modified?.total}
            covered={modified?.covered}
            label="MODIFIED"
          />
        </div>
      </div>
      <TableActionsProvider>
        <MethodsTable
          topic={`/build/scopes/${scopeId}/coverage/packages`}
          classesTopicPrefix={`build/scopes/${scopeId}`}
          showCoverageIcon={Boolean(activeSessions.length) || Boolean(scope?.sessionsFinished)}
        />
      </TableActionsProvider>
    </>
  );
};
