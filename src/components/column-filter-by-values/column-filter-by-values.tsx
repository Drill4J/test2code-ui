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
  Formik, Form, HeadlessSelect, Icons, OptionType, Checkbox, Button, Field,
} from "@drill4j/ui-kit";
import React, { useMemo } from "react";
import tw, { styled } from "twin.macro";

export const ColumnFilterByValues = (options: OptionType[]) => ({
  column: {
    filterValue = {}, setFilter = () => {}, Header = "",
  } = {},
}: any) => {
  const initialValues = useMemo(() => options.reduce((acc, option) => ({
    ...acc,
    [option.value]: filterValue[option.value] || false,
  }), {}), [options]);

  return (
    <Formik
      initialValues={initialValues as Record<string, boolean>}
      onSubmit={(values) => {
        setFilter(Object.entries(values)
          .filter(([_, value]) => value)
          .reduce((acc, [key]) => ({ ...acc, [key]: true }), {}));
      }}
    >
      {({ dirty, values }) => (
        <Form>
          <HeadlessSelect options={options}>
            {({ isOpen, setIsOpen }) => (
              <>
                <FilterIcon
                  isActive={isOpen}
                  tw="text-monochrome-dark-tint"
                  onClick={() => setIsOpen(!isOpen)}
                />
                {isOpen && (
                  <HeadlessSelect.Body tw="!w-[264px]">
                    <HeadlessSelect.ContainerWithScroll>
                      {options.map(({ label, value }) => (
                        <HeadlessSelect.Option
                          key={value}
                        >
                          <label
                            htmlFor={value}
                            tw="flex gap-x-2 items-center cursor-pointer truncate font-light"
                            title={label}
                            data-test={`${Header.toLowerCase()}:column-filter:option`}
                          >
                            <Field
                              tw="text-blue-default"
                              name={value}
                              id={value}
                              component={Checkbox}
                              checked={values[value]}
                            />
                            {label}
                          </label>
                        </HeadlessSelect.Option>
                      ))}
                    </HeadlessSelect.ContainerWithScroll>
                    <HeadlessSelect.Footer tw="!justify-end !pt-2 !pb-1">
                      <Button primary size="small" type="submit" disabled={!dirty}>Apply</Button>
                    </HeadlessSelect.Footer>
                  </HeadlessSelect.Body>
                )}
              </>
            )}
          </HeadlessSelect>
        </Form>
      )}
    </Formik>
  );
};

const FilterIcon = styled(Icons.Filter)`
  ${tw`
    text-monochrome-default
    hover:text-blue-medium-tint 
    active:text-blue-shade
    cursor-pointer
  `}

  ${({ isActive }: { isActive: boolean}) => isActive && tw`text-blue-default`}
`;

export const filterByValues = (accessor: string) => (rows: any, _: any, filterValue: Record<string, boolean>) => {
  if (Object.keys(filterValue).length === 0) {
    return rows;
  }
  return rows.filter((row: any) => {
    const rowValue = row.values[accessor] || "";
    return filterValue[rowValue];
  });
};
