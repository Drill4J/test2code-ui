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
  Button, Modal, Icons, GeneralAlerts, Spinner, composeValidators, numericLimits, positiveInteger,
} from "@drill4j/ui-kit";
import { Form, Formik } from "formik";
import { useCloseModal, useGeneralAlertMessage } from "@drill4j/common-hooks";
import tw, { styled } from "twin.macro";

import {
  ConditionSetting,
  ConditionSettingByType, QualityGate, QualityGateStatus as Status,
} from "types/quality-gate-type";
import { useAgentRouteParams, useBuildVersion } from "hooks";
import { QualityGateStatus } from "./quality-gate-status";
import { QualityGateSettings } from "./quality-gate-settings";
import { updateQualityGateSettings } from "./api";

const validateQualityGate = (formValues: ConditionSettingByType) => composeValidators(
  formValues.coverage?.enabled ? numericLimits({
    fieldName: "coverage.condition.value",
    fieldAlias: "Build coverage",
    unit: "",
    min: 0.1,
    max: 100,
  }) : () => undefined,
  formValues.risks?.enabled ? positiveInteger("risks.condition.value", "The field") : () => undefined,
  formValues.tests?.enabled ? positiveInteger("tests.condition.value", "The field") : () => undefined,
)(formValues);

export const QualityGatePane = () => {
  const { pluginId = "", agentId = "" } = useAgentRouteParams();
  const [isEditing, setIsEditing] = useState(false);
  const { generalAlertMessage, showGeneralAlertMessage } = useGeneralAlertMessage();
  const closeModal = useCloseModal("/quality-gate");

  const handleOnToggle = () => {
    if (!isEditing) {
      closeModal();
      setIsEditing(false);
    }
  };

  const { status = "FAILED" } = useBuildVersion<QualityGate>("/data/quality-gate") || {};
  const conditionSettings = useBuildVersion<ConditionSetting[]>("/data/quality-gate-settings") || [];

  const conditionSettingByType = conditionSettings.reduce(
    (conditionSetting, measureType) => ({
      ...conditionSetting,
      [measureType.condition.measure]: measureType,
    }),
    {} as ConditionSettingByType,
  );

  const StatusIcon = Icons[status];

  const configured = conditionSettings.some(({ enabled }) => enabled);

  return (
    <Modal isOpen onToggle={handleOnToggle}>
      <Formik
        onSubmit={async (values) => {
          await updateQualityGateSettings(agentId, pluginId, showGeneralAlertMessage)(values as ConditionSettingByType);
          setIsEditing(false);
        }}
        initialValues={{
          coverage: {
            enabled: conditionSettingByType.coverage?.enabled,
            condition: {
              ...conditionSettingByType.coverage?.condition,
              value: conditionSettingByType.coverage?.enabled ? String(conditionSettingByType.coverage.condition.value) : undefined,
            },
          },
          risks: {
            enabled: conditionSettingByType.risks?.enabled,
            condition: {
              ...conditionSettingByType.risks?.condition,
              value: conditionSettingByType.risks?.enabled ? String(conditionSettingByType.risks.condition.value) : undefined,
            },
          },
          tests: {
            enabled: conditionSettingByType.tests?.enabled,
            condition: {
              ...conditionSettingByType.tests?.condition,
              value: conditionSettingByType.tests?.enabled ? String(conditionSettingByType.tests.condition.value) : undefined,
            },
          },
        } as any}
        validate={validateQualityGate}
        enableReinitialize
      >
        {({
          values, isValid, dirty, isSubmitting,
        }) => (
          <Form tw="flex flex-col h-full font-regular">
            <div tw="flex justify-between items-center h-16 px-6 border-b border-monochrome-medium-tint">
              <div tw="text-20 leading-32" data-test="quality-gate-pane:header-title">Quality Gate</div>
              {configured && !isEditing && (
                <StatusIconWrapper status={status}>
                  <StatusIcon width={24} height={24} data-test="quality-gate-pane:header-status-icon" />
                </StatusIconWrapper>
              )}
            </div>
            <GeneralAlerts type="INFO" data-test="quality-gate-pane:general-alerts:info">
              {configured && !isEditing
                ? "Meet all conditions to pass the quality gate."
                : "Choose the metrics and define their threshold."}
            </GeneralAlerts>
            {generalAlertMessage?.type && (
              <GeneralAlerts type={generalAlertMessage.type}>
                {generalAlertMessage.text}
              </GeneralAlerts>
            )}
            {configured && !isEditing
              ? (
                <QualityGateStatus conditionSettingByType={values} />
              )
              : (
                <QualityGateSettings conditionSettingByType={values} />
              )}
            <ActionsPanel>
              {configured && !isEditing ? (
                <Button
                  primary
                  size="large"
                  onClick={() => setIsEditing(true)}
                  data-test="quality-gate-pane:edit-button"
                >
                  Edit
                </Button>
              )
                : (
                  <Button
                    className="flex justify-center items-center gap-x-1 w-16"
                    primary
                    size="large"
                    disabled={!isValid || !dirty || isSubmitting}
                    type="submit"
                    data-test="quality-gate-pane:save-button"
                  >
                    {isSubmitting ? <Spinner disabled /> : "Save"}
                  </Button>
                )}
              {configured && isEditing && (
                <Button
                  className="flex gap-x-2"
                  secondary
                  size="large"
                  onClick={() => setIsEditing(false)}
                  data-test="quality-gate-pane:back-button"
                >
                  <Icons.Expander width={8} height={14} rotate={180} />
                  <span>Back</span>
                </Button>
              )}
              <Button
                secondary
                size="large"
                onClick={handleOnToggle}
                data-test="quality-gate-pane:cancel-button"
              >
                Close
              </Button>
            </ActionsPanel>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

const StatusIconWrapper = styled.div(({ status }: { status: Status }) => [
  tw`flex items-center`,
  status === "PASSED" && tw`text-green-default`,
  status === "FAILED" && tw`text-red-default`,
]);

const ActionsPanel = styled.div`
  ${tw`grid gap-4 items-center h-20 pr-6 pl-6 mt-auto bg-monochrome-light-tint`};
  grid-template-columns: max-content max-content max-content;
`;
