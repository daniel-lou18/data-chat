import { HousePriceTable } from "./components/HousePriceTable";
import { sampleHousePriceData } from "./data/sampleData";

function App() {
  return (
    <div className="max-h-screen bg-gray-100 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Dashboard</h1>
        </div>

        <HousePriceTable data={sampleHousePriceData} />
      </div>
    </div>
  );
}

export default App;
