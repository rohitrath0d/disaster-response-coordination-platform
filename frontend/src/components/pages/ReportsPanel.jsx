import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import ReportForm from "./ReportForm";
import ReportList from "./ReportList";
import { useParams } from "react-router-dom";

const ReportsPanel = () => {
  const { id: disasterId } = useParams(); // from URL
  const storedId = localStorage.getItem("disasterId");
  const finalId = disasterId || storedId;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📢 Report Management</h2>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className= "bg-gray-100 p-1 rounded-lg w-full flex justify-around">
          <TabsTrigger value="submit">📝 Submit Report</TabsTrigger>
          <TabsTrigger value="list">📋 All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <ReportForm disasterId={finalId} />
        </TabsContent>

        <TabsContent value="list">
          <ReportList disasterId={finalId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPanel;
