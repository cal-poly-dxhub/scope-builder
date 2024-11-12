import { Route, Routes } from "react-router-dom";

import { Categories } from "./categories";

export const ScopeBuilderRouter = () => {
  return (
    <Routes>
      <Route path="categories" element={<Categories />} />
    </Routes>
  );
};
