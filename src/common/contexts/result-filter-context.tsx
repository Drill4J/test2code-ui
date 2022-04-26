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
import React, { createContext, useContext } from "react";
import { useFilteredData } from "hooks";
import { TestTypeSummary } from "types";
import { useFilterState } from "./filter-context";

export const ResultFilterContext = createContext({ isEmptyFilterResult: false });

export function useResultFilterState() {
  const context = useContext(ResultFilterContext);
  if (!context) {
    throw new Error("useResultFilter must be used within a resultFilterContext-");
  }
  return context;
}

export const ResultFilterContextProvider: React.FC = ({ children }) => {
  const { filterId } = useFilterState();
  const testsByType = useFilteredData<TestTypeSummary[]>("/build/summary/tests/by-type") || [];
  const isEmptyFilterResult = Boolean(filterId) && testsByType.length === 0;

  return (
    <ResultFilterContext.Provider value={{ isEmptyFilterResult }}>
      {children}
    </ResultFilterContext.Provider>
  );
};
