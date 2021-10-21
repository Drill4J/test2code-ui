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
import { useEffect, useState } from "react";
import { useAsyncDebounce } from "react-table";

export function useFilter<T>(data: T[], predicate: (filter: string) => (value: T) => boolean) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [filter, setFilter] = useState("");

  const onFilter = useAsyncDebounce(() => {
    setFilteredData(data.filter(predicate(filter)));
    setIsProcessing(false);
  }, 500);

  useEffect(() => {
    setFilteredData((prevData) => (prevData.length > 0 ? prevData : data));
    setIsProcessing(true);
    onFilter();
  }, [data.length, filter]);

  return {
    filter, filteredData, setFilter, isProcessing,
  };
}
