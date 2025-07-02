/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ResourceForm from "./ResourceForm";
import NearbyResources from "./NearbyResources";
import ResourceList from "./ResourceList";

const ResourcesPanel = () => {
  const { id:disasterId } = useParams(); // Disaster ID from URL
    // const disasterId = localStorage.getItem("disasterId");


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🗺️ Resource Management</h2>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className= "bg-gray-100 w-full p-1 rounded-lg justify-around">
          <TabsTrigger value="add">➕ Add Resource</TabsTrigger>
          <TabsTrigger value="nearby">📍 Nearby Resources</TabsTrigger>
          <TabsTrigger value="list">📋 All Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <ResourceForm />
        </TabsContent>

        <TabsContent value="nearby">
          <NearbyResources />
        </TabsContent>

        <TabsContent value="list">
          <ResourceList 
          disasterId={disasterId}
          // disasterId={formData?.id || initialData?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesPanel;
