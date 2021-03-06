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
import { EVENT_LABELS, PLUGIN_EVENT_NAMES, sendPluginEvent } from "common/analytic";

export async function finishSession(
  agentId: string, sessionId: string,
) {
  try {
    await axios.post(`/agents/${agentId}/plugins/${PLUGIN_ID}/dispatch-action`, {
      type: "STOP",
      payload: { sessionId },
    });
    sendAlertEvent({
      type: "SUCCESS",
      title: "Session has been finished successfully. All your progress has been added to the active scope.",
    });
    sendPluginEvent({
      name: PLUGIN_EVENT_NAMES.CLICK_ON_FINISH_SESSION_BUTTON,
      label: EVENT_LABELS.SESSION_MANAGEMENT,
    });
  } catch ({ response: { data: { message } = {} } = {} }) {
    sendAlertEvent({
      type: "ERROR",
      title: message || "There is some issue with your action. Please try again later.",
    });
  }
}
