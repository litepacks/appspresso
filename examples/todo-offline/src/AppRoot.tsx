import { Layout } from "appspresso/components/shell";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TodoPage } from "./pages/TodoPage";

export function AppRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TodoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
