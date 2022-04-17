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
  Button,
  composeValidators,
  Field,
  Fields,
  Form,
  FormGroup,
  Formik, FormValidator,
  getPropertyByPath,
  Icons,
  Menu,
  required,
  sendAlertEvent,
  sizeLimit,
} from "@drill4j/ui-kit";
import { v4 as uuidv4 } from "uuid";
import React, { useMemo, useState } from "react";
import tw, { styled } from "twin.macro";

import { useAgentRouteParams, useTestToCodeData, useTestToCodeRouteParams } from "hooks";
import {
  BetweenOp, Filter, OP, TestOverviewFilter, BuildAttribute,
} from "types";
import { useSetFilterDispatch } from "common";
import { createFilter, updateFilter } from "../../../api";
import { DeleteFilterModal } from "./delete-filter-modal";
import { CustomAttribute, SelectAttribute, Values } from "./select-attribute";
import { ConfigureFilterSate, FILTER_STATE } from "../types";

/* eslint-disable react/no-array-index-key */

interface Props {
  closeConfigureFilter: () => void;
  filterId: string | null;
  filters: Filter[];
  configureFilterState: ConfigureFilterSate;
  setConfigureFilter: (val: ConfigureFilterSate) => void;
}

export const ConfigureFilter = ({
  closeConfigureFilter, filterId, configureFilterState, setConfigureFilter, filters,
}: Props) => {
  const isEditing = configureFilterState === FILTER_STATE.EDITING;
  const [isDeleteFilterModalOpen, setIsDeleteFilterModalOpen] = useState(false);
  const { agentId } = useAgentRouteParams();
  const { buildVersion } = useTestToCodeRouteParams();
  const setFilter = useSetFilterDispatch();
  const attributes = useTestToCodeData<BuildAttribute[]>("/build/attributes") || [];
  const filter = useTestToCodeData<TestOverviewFilter>(isEditing ? `/build/filters/${filterId}` : null);

  const { name: filterName, attributes: filterAttributes = [] } = filter || {};

  const attributesOptions = useMemo(() => attributes
    .map(({ name = "", isLabel = false }) => ({ value: name, label: name, isLabel })), [attributes]);
  const filterNames = useMemo(() => filters.map(({ name = "" }) => name), [filters]);

  const transformedFilterAttributes = useMemo(() => filterAttributes
    .map(({
      fieldPath, valuesOp, values = [], isLabel,
    }) => ({
      id: uuidv4(),
      fieldPath,
      valuesOp,
      isLabel,
      values: values.reduce((acc, { value }) => ({ ...acc, [value]: true }), {}),
    })), [filterAttributes]);

  const initialValues = useMemo(() => (isEditing ? {
    name: filterName,
    attributes: transformedFilterAttributes,
  } : {
    name: `New filter ${filters.length + 1}`,
    attributes: [{
      fieldPath: "", values: {}, valuesOp: BetweenOp.OR, id: uuidv4(), isLabel: false,
    }],
  }), [isEditing, filterName, transformedFilterAttributes]);

  return (
    <div tw="relative p-6 bg-monochrome-light-tint border-b border-monochrome-medium-tint">
      <Formik
        initialValues={initialValues as Values}
        onSubmit={async ({ name, attributes: selectedAttributes }: any) => {
          const values = {
            id: filterId || "",
            name,
            buildVersion,
            attributes: selectedAttributes.map(({
              valuesOp, values: attrValues, fieldPath, isLabel,
            }: any) => ({
              fieldPath,
              valuesOp,
              isLabel,
              values: Object.keys(attrValues).map((value) => ({ value, op: OP.EQ })),
            })),
          };

          const action = isEditing ? updateFilter : createFilter;
          await action(agentId, values, {
            onSuccess: (createdFilterId) => {
              sendAlertEvent({ type: "SUCCESS", title: "Filter has been saved successfully." });
              setFilter(createdFilterId);
              setConfigureFilter(FILTER_STATE.EDITING);
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
          unusedName("name",
            isEditing // if we editing filter we should not throw error on editing filter with initial name
              ? filterNames.filter((name) => name !== filterName)
              : filterNames),
          emptyAttribute(),
        ) as any}
        enableReinitialize
        validateOnChange
        validateOnMount
      >
        {({
          setFieldValue, values, isSubmitting, isValid, dirty, resetForm, errors,
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
                    <SelectAttribute
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
                tw="flex items-center gap-x-2 ml-6 link text-14 leading-24
                cursor-pointer font-semibold disabled:(text-blue-default opacity-40)"
                type="button"
                disabled={Boolean(errors.attributes)}
                onClick={() => setFieldValue(`attributes[${values.attributes.length}]`, { id: uuidv4(), valuesOp: BetweenOp.OR })}
              >
                <Icons.Plus />Add New
              </button>
            </div>
            <div tw="flex gap-x-4 items-center justify-end border-l border-monochrome-medium-tint">
              {isEditing && dirty && (
                <Button
                  secondary
                  size="large"
                  onClick={() => resetForm({ values: initialValues } as any)}
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
                {isEditing ? "Apply & Save" : "Create & Apply"}
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
                        resetForm({ values: newValues } as any);
                        setConfigureFilter(FILTER_STATE.EDITING);
                        setFilter(null);
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
      {filterName && filterId && isDeleteFilterModalOpen && (
        <DeleteFilterModal
          closeModal={() => setIsDeleteFilterModalOpen(false)}
          closeEditingFilter={() => {
            closeConfigureFilter();
            setFilter(null);
          }}
          filterName={filterName}
          filterId={filterId}
        />
      )}
    </div>
  );
};

const HideCriteria = styled.button`
  ${tw`border border-monochrome-medium-tint bg-monochrome-white text-blue-default text-10 leading-14 font-bold`}
  border-radius: 8px 8px 0px 0px;
`;

const unusedName = (field: string, names: string[]): FormValidator => (valitationItem) => {
  const value = getPropertyByPath<string>(valitationItem, field);
  const hasSameName = names.some(name => name === value);
  return hasSameName ? { [field]: "Filter with such name already exists." } : {};
};

const emptyAttribute = (): FormValidator => (valitationItem) => {
  const field = "attributes";
  const attributes = getPropertyByPath<CustomAttribute[]>(valitationItem, field);
  const isValid = attributes.every(({ values = {}, fieldPath }) =>
    Boolean(fieldPath) && Object.values(values).some(Boolean)); // has some selected attribute value
  return isValid ? {} : { [field as string]: "Please select attributes" };
};
