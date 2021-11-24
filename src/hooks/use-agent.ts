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
import { useParams } from "@drill4j/ui-kit";

import { Agent } from "@drill4j/types-admin";
import { useAdminConnection } from "./use-admin-connection";

export const useAgent = (id?:string) => {
  const { agentId = "" } = useParams<{ agentId?: string;}>();
  return useAdminConnection<Agent>(`/api/agents/${id || agentId}`) || {};
};
