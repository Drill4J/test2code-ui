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
import { useState, useEffect } from "react";

import { Baseline } from "types/baseline";
import { test2CodePluginSocket } from "common";
import { useParams } from "react-router-dom";

export function useBaselineVersion(activeAgentId?: string, activeBuildVersion?: string): Baseline | null {
  const { agentId, buildVersion } = useParams<{ agentId?: string; buildVersion?: string; }>();
  const [data, setData] = useState<Baseline | null>(null);

  useEffect(() => {
    function handleDataChange(newData: Baseline) {
      setData(newData);
    }

    const unsubscribe = (agentId && buildVersion) || (activeAgentId && activeBuildVersion)
      ? test2CodePluginSocket.subscribe("/data/baseline", handleDataChange, {
        agentId: activeAgentId || agentId,
        buildVersion: activeBuildVersion || buildVersion,
        type: "AGENT",
      })
      : null;

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [agentId, buildVersion, activeBuildVersion, activeAgentId]);

  return data;
}
