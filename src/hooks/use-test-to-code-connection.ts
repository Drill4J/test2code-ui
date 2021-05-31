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
import { defaultTest2CodePluginSocket } from "@Drill4J/sockets";
import { matchPath, useLocation, useParams } from "react-router-dom";

export function useTestToCodeConnection<T>(
  topic: string,
  message: Record<string, unknown> = {}
): T | null {
  const [data, setData] = useState<T | null>(null);
  const { pathname } = useLocation();
  const params = new URLSearchParams(window.location.search);
  const path = "/:pluginId/:id";
  const { params: { id = "" } = {} } =
    matchPath<{ id?: string }>(pathname, { path }) || {};

  useEffect(() => {
    function handleDataChange(newData: T) {
      setData(newData);
    }

    const unsubscribe = defaultTest2CodePluginSocket.subscribe(
      topic,
      handleDataChange,
      {
        type: "AGENT",
        agentId: id,
        buildVersion: params.get("build"),
        ...message,
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
}
