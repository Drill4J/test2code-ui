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
import axios from "axios";

import { PLUGIN_ID } from "common";

interface Payload {
  id: string;
}

export const dublicateFilter = async (
  agentId: string,
  payload: Payload,
  { onSuccess, onError }: { onSuccess?: (data: string) => void; onError?: (message: string) => void } = {},
) => {
  try {
    const data = await axios.post(`/agents/${agentId}/plugins/${PLUGIN_ID}/dispatch-action`, {
      type: "DUPLICATE_FILTER",
      payload,
    });
    onSuccess && onSuccess(data.data.message);
  } catch ({ response: { data: { message } = {} } = {} }) {
    onError && onError(message || "There is some issue with your action. Please try again later.");
  }
};
