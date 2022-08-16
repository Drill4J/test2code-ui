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
  Modal, Button, sendAlertEvent, Spinner,
} from "@drill4j/ui-kit";
import { useAgentRouteParams } from "hooks";
import { deleteFilter } from "pages/agent/api";
import "twin.macro";

interface Props {
  closeModal: () => void;
  closeEditingFilter: () => void;
  filterName: string;
  filterId: string;
}

export const DeleteFilterModal = ({
  closeModal, closeEditingFilter, filterName, filterId,
}: Props) => {
  const { agentId } = useAgentRouteParams();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal onClose={closeModal}>
      <Modal.Content>
        <Modal.Header>Delete Filter</Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the filter “{filterName}”?
        </Modal.Body>
        <Modal.Footer tw="flex gap-x-4">
          <Button
            tw="flex justify-center w-27"
            size="large"
            primary
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              deleteFilter(agentId, { id: filterId }, {
                onSuccess: () => {
                  sendAlertEvent({ type: "SUCCESS", title: "Filter has been deleted successfully." });
                  setIsLoading(false);
                  closeEditingFilter();
                  closeModal();
                },
                onError: (msg) => sendAlertEvent({ type: "ERROR", title: msg }),
              });
            }}
          >
            {isLoading ? <Spinner /> : "Yes, delete"}
          </Button>
          <Button size="large" secondary onClick={closeModal}>Cancel</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
