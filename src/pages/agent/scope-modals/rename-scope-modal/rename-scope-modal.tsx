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
import React from "react";
import {
  Formik, Field, Form,
  Button, FormGroup, Modal, Spinner, Fields,
  composeValidators, sizeLimit, required, useCloseModal,
  useQueryParams, sendAlertEvent,
} from "@drill4j/ui-kit";

import "twin.macro";

import { ScopeSummary } from "types/scope-summary";
import { ActiveScope } from "types/active-scope";

import { useAgentRouteParams, useFilteredData } from "hooks";
import { renameScope } from "../../api";

const validateScope = composeValidators(
  required("name", "Scope Name"),
  sizeLimit({
    name: "name", min: 1, max: 64, alias: "Scope name",
  }),
);

export const RenameScopeModal = () => {
  const { agentId = "", pluginId = "" } = useAgentRouteParams();
  const { scopeId = "" } = useQueryParams<{ scopeId?: string; }>();
  const scope = useFilteredData<ActiveScope>(`/build/scopes/${scopeId}`);
  const closeModal = useCloseModal(["scopeId"]);

  return (
    <Modal onClose={closeModal}>
      <Modal.Content tw="w-108" type="info">
        <Modal.Header>
          <div tw="text-20">Rename Scope</div>
        </Modal.Header>
        <Formik
          onSubmit={(values) => renameScope(agentId, pluginId, {
            onSuccess: () => {
              sendAlertEvent({ type: "SUCCESS", title: "Scope name has been changed." });
              closeModal();
            },
            onError: message => sendAlertEvent({ type: "ERROR", title: message }),
          })(values as ScopeSummary)}
          validate={validateScope}
          initialValues={scope || {}}
          enableReinitialize
        >
          {({
            isSubmitting, dirty, isValid,
          }) => (
            <Form>
              <Modal.Body>
                <FormGroup label="Scope Name">
                  <Field name="name" component={Fields.Input} placeholder="Enter scope name" />
                </FormGroup>
              </Modal.Body>
              <Modal.Footer tw="flex items-center gap-4">
                <Button
                  className="flex justify-center items-center gap-x-1 w-16"
                  primary
                  size="large"
                  type="submit"
                  disabled={isSubmitting || !dirty || !isValid}
                >
                  {isSubmitting ? <Spinner /> : "Save"}
                </Button>
                <Button secondary size="large" onClick={closeModal}>
                  Cancel
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Content>
    </Modal>
  );
};
