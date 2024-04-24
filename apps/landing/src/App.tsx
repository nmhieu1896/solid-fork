import type { Component } from "solid-js";
import MyForm from "./pages/form";

const App: Component = () => {
  return (
    <div>
      <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
      <MyForm />
    </div>
  );
};

export default App;
