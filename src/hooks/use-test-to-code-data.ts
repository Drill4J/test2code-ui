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
import {
  useCallback, useEffect, useMemo, useState,
} from "react";
import { OutputType, Search, Sort } from "@drill4j/types-admin";

import { test2CodePluginSocket } from "common/connections";
import { useFilterState } from "common";
import { useAgentRouteParams } from "./use-agent-route-params";
import { useTestToCodeRouteParams } from "./use-test2code-params";

interface Message {
  agentId?: string;
  buildVersion?: string;
  filters?: Search[],
  orderBy?: Sort[],
  output?: OutputType,
}

export function useTestToCodeData<T>(
  topic: string | null,
  message: Message = {},
): T | null {
  const [data, setData] = useState<T | null>(null);
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { filterId } = useFilterState();
  const hasBuildVersion = buildVersion || message.buildVersion;
  const memoMessage = useMemo(() => ({
    agentId, buildVersion, type: "AGENT", ...message,
  }), [agentId, buildVersion, filterId, message.filters,
    message.orderBy, message.buildVersion, message.agentId, message.output]);
  const handleDataChange = useCallback((newData: T) => setData(newData), [setData]);

  useEffect(() => {
    const unsubscribe = topic && hasBuildVersion && agentId && test2CodePluginSocket.subscribe(
      topic,
      handleDataChange,
      memoMessage,
    );

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [agentId, buildVersion, topic, memoMessage]);

  return data;
}
