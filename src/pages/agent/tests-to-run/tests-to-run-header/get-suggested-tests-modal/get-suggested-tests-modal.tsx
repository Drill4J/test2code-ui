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
import React, { useEffect, useState } from "react";
import {
  Button, Icons, Modal, useCloseModal,
} from "@drill4j/ui-kit";
import { copyToClipboard } from "@drill4j/common-utils";
import "twin.macro";

import { getTestsToRunURL, TestsToRunUrl } from "components";
import { KEY_METRICS_EVENT_NAMES, sendKeyMetricsEvent } from "common/analytic";
import { useAgentRouteParams } from "hooks";

export const GetSuggestedTestsModal = () => {
  const { agentId = "", pluginId = "" } = useAgentRouteParams();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setCopied(false), 5000);
    copied && timeout;
    return () => clearTimeout(timeout);
  }, [copied]);
  const closeModal = useCloseModal("/get-suggested-tests");

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <span>Get Suggested Tests</span>
        </Modal.Header>
        <Modal.Body
          tw="flex flex-col gap-y-4 text-14 leading-20 break-words text-monochrome-black"
          data-test="get-suggested-tests-modal:message"
        >
          <span>
            These are recommendations for this build updates only.<br />
            Use this Curl in your command line to get JSON:
          </span>
          <TestsToRunUrl agentId={agentId} pluginId={pluginId} agentType="Agent" />
        </Modal.Body>
        <Modal.Footer tw="flex justify-end gap-x-4">
          <Button
            tw="min-w-154px"
            primary
            size="large"
            onClick={() => {
              copyToClipboard(getTestsToRunURL(agentId, pluginId, "Agent"));
              setCopied(true);
              sendKeyMetricsEvent({
                name: KEY_METRICS_EVENT_NAMES.CLICK_ON_COPY_TO_CLIPBOARD_BUTTON,
              });
            }}
            data-test="get-suggested-tests-modal:copy-to-clipboard-button"
          >
            {copied
              ? (
                <div tw="flex justify-center items-center gap-x-2 w-full">
                  <Icons.Check height={10} width={14} viewBox="0 0 14 10" />
                  Copied
                </div>
              )
              : "Copy to Clipboard"}
          </Button>
          <Button
            secondary
            size="large"
            onClick={closeModal}
            data-test="get-suggested-tests-modal:close-button"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
