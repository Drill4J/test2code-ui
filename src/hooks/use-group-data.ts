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
import { test2CodePluginSocket } from "../common";

export const useGroupData = <Data>(topic: string, serviceGroupId: string): Data | null => {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    function handleDataChange(newData: Data) {
      setData(newData);
    }

    const unsubscribe = test2CodePluginSocket.subscribe(
      topic, handleDataChange, { groupId: serviceGroupId, type: "GROUP" },
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, [serviceGroupId]);

  return data;
};
