import { Route, Routes } from "react-router-dom";

import Builder from "./builder";
import Categories from "./categories";

export default function ScopeBuilderRouter() {
  return (
    <Routes>
      <Route path="categories" element={<Categories />} />
      <Route path="builder" element={<Builder />} />
    </Routes>
  );
}
