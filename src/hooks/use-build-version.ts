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
import { useEffect, useState } from "react";
import { OutputType, Search, Sort } from "@drill4j/types-admin";

import { test2CodePluginSocket } from "common/connections";
import { useAgentParams } from "./use-agent-params";
import { useTestToCodeParams } from "./use-test-to-code-params";

interface Message {
  agentId?: string;
  buildVersion?: string;
  filters?: Search[],
  orderBy?: Sort[],
  output?: OutputType,
}

export function useBuildVersion<T>(
  topic: string,
  message: Message = {},
): T | null {
  const [data, setData] = useState<T | null>(null);
  const { agentId = "" } = useAgentParams();
  const { buildVersion } = useTestToCodeParams();
  useEffect(() => {
    function handleDataChange(newData: T) {
      setData(newData);
    }

    const unsubscribe = test2CodePluginSocket.subscribe(
      topic,
      handleDataChange,
      {
        agentId,
        buildVersion,
        type: "AGENT",
        ...message,
      },
    );

    return () => {
      unsubscribe();
    };
  }, [message.buildVersion, message.agentId,
    message.output, agentId, buildVersion, topic,
    message.filters, message.orderBy]);

  return data;
}
