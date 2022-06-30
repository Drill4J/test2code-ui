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
import React, {
  createContext, Dispatch, SetStateAction, useContext, useState,
} from "react";

type FilterId = string | null

interface State {
  filterId: FilterId;
}

export const defaultState: State = { filterId: null };

export const FilterContext = createContext<State>(defaultState);

export const SetFilterDispatchContext = createContext<Dispatch<SetStateAction<FilterId>>>(() => {});

export function useFilterState() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterState must be used within a filterContext");
  }
  return context;
}

export function useSetFilterDispatch(): Dispatch<SetStateAction<FilterId>> {
  const context = useContext(SetFilterDispatchContext);
  if (!context) {
    throw new Error("useSetFilterDispatch must be used within a setFilterDispatchContext");
  }
  return context;
}

export const FilterContextProvider: React.FC = ({ children }) => {
  const [filter, setFilter] = useState<State>(defaultState);

  return (
    <FilterContext.Provider value={filter}>
      <SetFilterDispatchContext.Provider value={((filterId: FilterId) => setFilter({ filterId })) as Dispatch<SetStateAction<FilterId>>}>
        {children}
      </SetFilterDispatchContext.Provider>
    </FilterContext.Provider>
  );
};
