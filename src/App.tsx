import { Outlet } from "react-router";

function App() {
  return (
    <div className="max-h-screen bg-gray-100 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
