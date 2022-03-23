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
import React, { useCallback, useState } from "react";
import {
  Autocomplete, HeadlessSelect, Icons, useFormikContext,
  OptionType,
} from "@drill4j/ui-kit";
import { Attribute, BetweenOp } from "types";
import { SelectAttributeValues } from "./select-attribute-values";
import "twin.macro";

interface Props {
  attributesOptions: {value: string; label: string; isLabel: boolean}[];
  accessor: number;
  defaultValue: string;
  removeAttribute: (() => void) | null;
}

export type CustomAttribute = Attribute & {id: string; values: Record<string, boolean>; isLabel: boolean};

export interface Values {
  name: string;
  attributes: CustomAttribute[];
}

export const SelectAttribute = ({
  attributesOptions, accessor, removeAttribute, defaultValue = "",
}: Props) => {
  const [attributeName, setAttributeName] = useState<string>(defaultValue);
  const { setFieldValue, values } = useFormikContext<Values>();
  const attrValues = values?.attributes[accessor]?.values || {};

  const onSelectAttribute = useCallback((value: string, option: OptionType) => {
    setFieldValue(`attributes[${accessor}].fieldPath`, value);
    setFieldValue(`attributes[${accessor}].isLabel`, option?.isLabel);
    setAttributeName(value as string);
  }, []);

  return (
    <div tw="grid grid-cols-[224px 4px 90px 300px 16px] items-center gap-x-2">
      <Autocomplete
        placeholder="Key"
        options={attributesOptions}
        onChange={onSelectAttribute as any}
        defaultValue={attributeName}
        onClear={() => setFieldValue(`attributes[${accessor}]`, { id: attrValues.id })}
      />
      <span>:</span>
      <HeadlessSelect
        options={[
          { value: BetweenOp.OR, labelInInput: "Any", label: "Any value is met" },
          { value: BetweenOp.AND, labelInInput: "All", label: "All values are met" },
        ]}
        defaultValue={BetweenOp.OR}
      >
        {({
          options, selectedOption, isOpen, selectValue, setIsOpen,
        }) => (
          <>
            <HeadlessSelect.Input>
              {selectedOption
                ? <HeadlessSelect.SelectedValue>{selectedOption.labelInInput}</HeadlessSelect.SelectedValue>
                : <HeadlessSelect.Placeholder>Operator</HeadlessSelect.Placeholder>}
            </HeadlessSelect.Input>
            {isOpen && (
              <HeadlessSelect.Body tw="!w-[150px] right-0">
                <HeadlessSelect.ContainerWithScroll>
                  {options.map(({ label, value }) => (
                    <HeadlessSelect.Option
                      selected={value === selectedOption?.value}
                      onClick={() => {
                        selectValue(value);
                        setFieldValue(`attributes[${accessor}].valuesOp`, value);
                        setIsOpen(false);
                      }}
                    >
                      {label}
                    </HeadlessSelect.Option>
                  ))}
                </HeadlessSelect.ContainerWithScroll>
              </HeadlessSelect.Body>
            )}
          </>
        )}
      </HeadlessSelect>
      <SelectAttributeValues
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
