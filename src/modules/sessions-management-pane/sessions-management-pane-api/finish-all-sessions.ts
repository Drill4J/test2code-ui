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
import { sendAlertEvent } from "@drill4j/ui-kit";

export const finishAllSession = async (
  { agentId, agentType }: { agentId: string, agentType: string },
  sessionCount = 0,
): Promise<void> => {
  try {
    await axios.post(`/${agentType === "ServiceGroup" ? "groups" : "agents"}/${agentId}/plugins/${PLUGIN_ID}/dispatch-action`, {
      type: "STOP_ALL",
    });
    sendAlertEvent({
      type: "SUCCESS",
      title: `(${sessionCount}) Sessions have been finished successfully. All your progress has been added to the active scope.`,
    });
  } catch ({ response: { data: { message } = {} } = {} }) {
    sendAlertEvent({
      type: "ERROR",
      title: message || "There is some issue with your action. Please try again later.",
    });
  }
};
