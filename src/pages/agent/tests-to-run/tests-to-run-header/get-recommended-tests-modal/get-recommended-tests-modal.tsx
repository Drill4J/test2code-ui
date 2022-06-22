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
  Button, Icons, LinkButton, Modal, useCloseModal,
} from "@drill4j/ui-kit";
import { copyToClipboard } from "@drill4j/common-utils";
import "twin.macro";

import { getTestsToRunURL, TestsToRunUrl } from "components";
import { KEY_METRICS_EVENT_NAMES, sendKeyMetricsEvent } from "common/analytic";
import { useAdminConnection, useAgentRouteParams } from "hooks";
import { AnalyticsInfo } from "types";

export const GetRecommendedTestsModal = () => {
  const { agentId = "", pluginId = "" } = useAgentRouteParams();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setCopied(false), 5000);
    copied && timeout;
    return () => clearTimeout(timeout);
  }, [copied]);
  const closeModal = useCloseModal();
  const { isAnalyticsDisabled } = useAdminConnection<AnalyticsInfo>("/api/analytics/info") || {};

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <span>Get Recommended Tests</span>
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
        <div tw="mt-8 py-4 px-6 border-t border-monochrome-medium-tint">
          <LinkButton
            onClick={() => {
              copyToClipboard(getTestsToRunURL(agentId, pluginId, "Agent"));
              setCopied(true);
              !isAnalyticsDisabled && sendKeyMetricsEvent({
                name: KEY_METRICS_EVENT_NAMES.CLICK_ON_COPY_TO_CLIPBOARD_BUTTON,
              });
            }}
            data-test="get-suggested-tests-modal:copy-to-clipboard-button"
          >
            {copied
              ? (
                <div tw="flex justify-center items-center gap-x-2 w-full">
                  <Icons.Check height={16} width={16} />
                  Copied
                </div>
              )
              : (
                <div tw="flex justify-center items-center gap-x-2 w-full">
                  <Icons.Copy height={16} width={16} />
                  Copy to Clipboard
                </div>
              )}
          </LinkButton>
        </div>
      </Modal.Content>
    </Modal>
  );
};
