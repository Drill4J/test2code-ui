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
import React, { useState } from "react";
import {
  Button, Modal, Checkbox, Spinner, useCloseModal, sendAlertEvent,
} from "@drill4j/ui-kit";
import tw, { styled } from "twin.macro";

import { BUILD_STATUS } from "common";
import {
  useActiveBuild, useAgentRouteParams, useFilteredData, useTestToCodeRouteParams,
} from "hooks";
import { Baseline } from "types/baseline";
import { toggleBaseline } from "../api";

const Message = styled.div`
  ${tw`text-14 leading-20`}
`;

const ActionButton = styled(Button)(({ isBaseline }: {isBaseline: boolean}) => [
  tw`place-content-center`,
  isBaseline && tw`w-40`,
  !isBaseline && tw`w-34`,
]);

export const BaselineBuildModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { pluginId, agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const { buildVersion: activeBuildVersion = "", buildStatus } = useActiveBuild(agentId) || {};
  const { version: baseline } = useFilteredData<Baseline>("/data/baseline", { buildVersion: activeBuildVersion }) || {};
  const isBaseline = baseline === buildVersion;
  const [isConfirmed, setIsConfirmed] = useState(isBaseline);
  const closeModal = useCloseModal();

  return (
    <Modal onClose={closeModal}>
      <Modal.Content type="info">
        <Modal.Header>
          {`${isBaseline ? "Unset" : "Set"} as Baseline Build`}
        </Modal.Header>
        <Modal.Body tw="w-108 font-regular flex flex-col gap-6">
          <Message className="flex items-center w-full">
            {isBaseline
              ? (
                <>
                  By confirming this action, you will unset this build as baseline. All<br />
                  subsequent builds won’t be compared to it.
                </>
              )
              : (
                <>
                  You will set the current build as baseline. All subsequent builds will be compared to it.
                </>
              )}
          </Message>
          {!isBaseline && (
            <Message tw="flex gap-2 w-full text-blue-default">
              <Checkbox
                data-test={`${isBaseline ? "unset" : "set"}-as-baseline:conformation-checkbox`}
                checked={isConfirmed}
                onChange={() => setIsConfirmed(!isConfirmed)}
              />
              <span tw="text-monochrome-black">
                I understand that it’s necessary to run all tests to determine the number of suggested tests.
              </span>
            </Message>
          )}
        </Modal.Body>
        <Modal.Footer tw="flex gap-x-4">
          <ActionButton
            primary
            size="large"
            isBaseline={isBaseline}
            onClick={async () => {
              try {
                setIsLoading(true);
                await toggleBaseline(agentId, pluginId);
                setIsLoading(false);
                sendAlertEvent({
                  type: "SUCCESS",
                  title: `Current build has been ${isBaseline
                    ? "unset as baseline successfully."
                    : "set as baseline successfully."}`,
                  text: isBaseline
                    ? "All subsequent builds won't be compared to it."
                    : "All subsequent builds will be compared to it.",
                });
              } catch ({ response: { data: { message } = {} } = {} }) {
                sendAlertEvent({
                  type: "ERROR",
                  title: `Failed to ${isBaseline ? "unset" : "set"} build as baseline. Please try again later.`,
                });
              }
              closeModal();
            }}
            disabled={(!isConfirmed && !isBaseline) || isLoading || buildStatus !== BUILD_STATUS.ONLINE}
            data-test={`baseline-build-modal:${isBaseline ? "unset" : "set"}-as-baseline-button`}
          >
            {isLoading && <Spinner />}
            {!isLoading && isBaseline && "Unset as Baseline"}
            {!isLoading && !isBaseline && "Set as Baseline"}
          </ActionButton>
          <Button secondary size="large" onClick={closeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
