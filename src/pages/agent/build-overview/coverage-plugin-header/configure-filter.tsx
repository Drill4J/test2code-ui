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
import {
  Autocomplete,
  Button,
  composeValidators,
  Field,
  Fields,
  Form,
  FormGroup,
  Formik,
  Icons,
  LightDropdown, Menu,
  MultipleSelectAutocomplete,
  required, sendAlertEvent,
  sizeLimit,
  useFormikContext,
} from "@drill4j/ui-kit";
import { v4 as uuidv4 } from "uuid";
import React, { useMemo, useState } from "react";
import tw, { styled } from "twin.macro";

import {
  useAgentRouteParams, useTestToCodeData, useTestToCodeRouteParams,
} from "hooks";
import {
  Attribute, BetweenOp, OP, TestOverviewFilter,
} from "types";
import { Link } from "react-router-dom";
import { createFilter, deleteFilter, updateFilter } from "../../api";
import { DeleteFilterModal } from "./delete-filter-modal";
import { useSetFilterDispatch } from "../../../../common";

/* eslint-disable react/no-array-index-key */

type CustomAttribute = Attribute & {id: string; values: Record<string, boolean>};

interface Props {
  closeConfigureFilter: () => void;
  filterId: string | null;
}

interface Values {
  name: string;
  attributes: CustomAttribute[];
}

// If filterId == null It means that we are creating new filter

export const ConfigureFilter = ({ closeConfigureFilter, filterId }: Props) => {
  const [isDeleteFilterModalOpen, setIsDeleteFilterModalOpen] = useState(false);
  const isEditing = Boolean(filterId);
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const setFilter = useSetFilterDispatch();
  const attributes = useTestToCodeData<string[]>("/build/attributes") || [];
  const filter = useTestToCodeData<TestOverviewFilter>(isEditing ? `/build/filters/${filterId}` : null);

  const { name: filterName, attributes: filterAttributes = [] } = filter || {};
  const attributesOptions = useMemo(() => attributes.map((attr) => ({ value: attr, label: attr })), [attributes]);

  const transformedFilterAttributes = useMemo(() => filterAttributes
    .map(({ fieldPath, valuesOp, values = [] }) => ({
      id: uuidv4(),
      fieldPath,
      valuesOp,
      values: values.reduce((acc, { value }) => ({ ...acc, [value]: true }), {}),
    })), [filterAttributes]);

  const initialValues = useMemo(() => (isEditing ? {
    name: filterName,
    attributes: transformedFilterAttributes,
  } : {
    name: "",
    attributes: [{
      fieldPath: "", values: {}, valuesOp: BetweenOp.OR, id: uuidv4(),
    }],
  }), [isEditing, filterName, transformedFilterAttributes]);

  return (
    <div tw="relative p-6 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
      <Formik
        initialValues={initialValues as Values}
        onSubmit={async ({ name, attributes: selectedAttributes }: any) => {
          const values = {
            name,
            buildVersion,
            attributes: selectedAttributes.map(({ valuesOp, values: attrValues, fieldPath }: any) => ({
              fieldPath,
              valuesOp,
              values: Object.keys(attrValues).map((value) => ({ value, op: OP.EQ })),
            })),
          };
          const action = filterId ? updateFilter : createFilter;
          await action(agentId, values, {
            onSuccess: () => {
              sendAlertEvent({ type: "SUCCESS", title: "Filter has been saved successfully." });
              closeConfigureFilter();
            },
            onError: (msg) => sendAlertEvent({ type: "ERROR", title: msg }),
          });
        }}
        validate={composeValidators(
          required("name"),
          sizeLimit({
            name: "name", min: 1, max: 40,
          }),
        ) as any}
        enableReinitialize
      >
        {({
          setFieldValue, values, isSubmitting, isValid, dirty, resetForm,
        }) => (
          <Form tw="grid grid-cols-[300px 1fr 300px]">
            <FormGroup tw="mr-6" label="Filter Name">
              <Field
                name="name"
                component={Fields.Input}
                placeholder="Enter filter’s name"
              />
            </FormGroup>
            <div tw="border-l border-monochrome-medium-tint">
              <FormGroup tw="mx-6 mb-3" label="Attributes">
                <div tw="flex flex-col gap-y-4">
                  {values.attributes.map((attr, index) => (
                    <ConfigureAttribute
                      key={attr.id}
                      accessor={index}
                      attributesOptions={attributesOptions}
                      removeAttribute={values.attributes.length > 1
                        ? () => setFieldValue("attributes", values.attributes.filter((_, attrIndex) => attrIndex !== index))
                        : null}
                      defaultValue={attr.fieldPath}
                    />
                  ))}
                </div>
              </FormGroup>
              <button
                tw="flex items-center gap-x-2 ml-6 link text-14 leading-24 cursor-pointer font-semibold"
                type="button"
                onClick={() => setFieldValue(`attributes[${values.attributes.length}]`, { id: uuidv4() })}
              >
                <Icons.Plus />Add New
              </button>
            </div>
            <div tw="flex gap-x-4 items-center justify-end border-l border-monochrome-medium-tint">
              {isEditing && dirty && (
                <Button
                  secondary
                  size="large"
                  onClick={() => resetForm(initialValues as any)}
                >
                  Discard
                </Button>
              )}
              {!isEditing && <Button secondary size="large" onClick={closeConfigureFilter}>Cancel</Button>}
              <Button
                type="submit"
                primary
                size="large"
                disabled={isSubmitting || !isValid || !dirty}
              >
                Apply & Save
              </Button>
              {isEditing && (
                <Menu
                  tw="mr-3"
                  items={[
                    {
                      label: "Duplicate filter",
                      icon: "Copy",
                      onClick: () => {
                        const newValues = { ...initialValues, name: `${initialValues.name} (1)` };
                        resetForm(newValues as any);
                      },
                    },
                    {
                      label: "Delete filter",
                      icon: "Delete",
                      onClick: () => setIsDeleteFilterModalOpen(true),
                    },
                  ]}
                  testContext="configure-filter"
                />
              )}
            </div>
          </Form>
        )}
      </Formik>
      <HideCriteria tw="absolute left-1/2 -translate-x-1/2 -bottom-px flex items-center gap-x-1 px-2" onClick={closeConfigureFilter}>
        <Icons.Expander width={8} height={8} rotate={-90} /> Hide Criteria
      </HideCriteria>
      {isDeleteFilterModalOpen && (
        <DeleteFilterModal
          closeModal={() => setIsDeleteFilterModalOpen(false)}
          closeEditingFilter={() => {
            closeConfigureFilter();
            setFilter(null);
          }}
        />
      )}
    </div>
  );
};

interface ConfigureAttributeProps {
  attributesOptions: {value: string, label: string}[];
  accessor: number;
  defaultValue: string;
  removeAttribute: (() => void) | null;
}

const ConfigureAttribute = ({
  attributesOptions, accessor, removeAttribute, defaultValue = "",
}: ConfigureAttributeProps) => {
  const [attributeName, setAttributeName] = useState<string>(defaultValue);
  const { setFieldValue, values } = useFormikContext<Values>();
  const attrValues = values?.attributes[accessor]?.values || {};

  return (
    <div tw="grid grid-cols-[224px 4px 84px 300px 16px] items-center gap-x-2">
      <Autocomplete
        placeholder="Key"
        options={attributesOptions}
        onChange={(value) => {
          setFieldValue(`attributes[${accessor}].fieldPath`, value);
          setAttributeName(value as string);
        }}
        defaultValue={attributeName}
      />
      <span>:</span>
      <LightDropdown
        placeholder="Operator"
        options={[
          { value: BetweenOp.OR, labelInInput: "Any", label: "Any value is met" },
          { value: BetweenOp.AND, labelInInput: "All", label: "All values are met" },
        ]}
        onChange={(value) => setFieldValue(`attributes[${accessor}].valuesOp`, value)}
        defaultValue={BetweenOp.OR}
        displayingInInputAccessor="labelInInput"
      />
      <AttributeValues
        onChange={(value) => setFieldValue(`attributes[${accessor}].values`, value)}
        currentValues={attrValues as any}
        attributeName={attributeName}
      />
      {removeAttribute && (
        <Icons.Delete
          tw="ml-2 text-monochrome-dark-tint cursor-pointer"
          width={16}
          height={16}
          onClick={removeAttribute}
        />
      )}
    </div>
  );
};

interface AttributeValuesProps {
  onChange: (values: Record<string, boolean>) => void;
  currentValues: Record<string, boolean>;
  attributeName: string;
}

const AttributeValues = ({ attributeName, onChange, currentValues }: AttributeValuesProps) => {
  const values = useTestToCodeData<string[]>(`/build/attributes/${attributeName}/values`) || [];
  const valuesOptions = useMemo(() => values.map((value) => ({ value, label: value })), [values]);
  return (
    <MultipleSelectAutocomplete
      placeholder="Value"
      options={valuesOptions}
      onChange={onChange as any}
      values={currentValues}
    />
  );
};

const HideCriteria = styled.button`
  ${tw`border border-monochrome-medium-tint bg-monochrome-white text-blue-default text-10 leading-14 font-bold`}
  border-radius: 8px 8px 0px 0px;
`;
