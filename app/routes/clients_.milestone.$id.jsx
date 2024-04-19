import { useLoaderData, useActionData, Form, Link, useNavigation, json } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { useState } from "react";
import { Switch } from "../components/ui/switch";
import { uploadFileToS3 } from "../utils/s3-utils";



export const loader = async (args) => {
    const { sessionClaims } = await getAuth(args);
  
    // If the user does not have the admin role, redirect them to the home page
    if (sessionClaims?.metadata.role !== "admin") {
      return redirect("/");
    }
  
    const projectid = args.params.id;
  
    // Query the milestones table for the given project_code
    const milestones = await db.query(
      `SELECT * FROM milestones WHERE project_code = $1 ORDER BY milestone_number ASC`,
      [projectid]
    );
  
    return json({ milestones: milestones.rows });
  };
  
  export const action = async ({ request, params }) => {
    const formData = await request.formData();
    const projectId = params.id;
    const milestoneNumber = formData.get("milestoneNumber");
    const isCompleted = formData.get("isCompleted") === "true";
    const completedDate = formData.get("completedDate");
    console.log(isCompleted);
  
    try {
      // Update the milestone in the database
      await db.query(
        `UPDATE milestones
         SET is_completed = $1, completed_date = $2
         WHERE project_code = $3 AND milestone_number = $4`,
        [isCompleted, completedDate, projectId, milestoneNumber]
      );
  
      return json({ message: "Milestone updated successfully." }, { status: 200 });
    } catch (error) {
      console.error("Error updating milestone:", error);
      return json({ error: "An error occurred while updating the milestone." }, { status: 500 });
    }
  };
  
  export default function Milestones() {
    const { milestones } = useLoaderData();
    const actionData = useActionData();
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const transition = useNavigation();
  
    const handleMilestoneClick = (milestone) => {
      setSelectedMilestone(milestone);
    };
  
    const closeModal = () => {
      setSelectedMilestone(null);
    };
    return (
      <div className="min-h-screen bg-gradient-to-r from-violet-500 to-violet-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Milestones</h1>
        {milestones.length === 0 ? (
          <p className="text-lg text-white text-center">No milestones for this project</p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center mb-4">
                  <div className="relative">
                    <div
                      className={`w-4 h-4 rounded-full z-10 ${
                        milestone.is_completed ? "bg-green-500 border-2 border-green-700" : "bg-red-500 border-2 border-red-700"
                      }`}
                    ></div>
                    {index < milestones.length - 1 && (
                      <div
                        className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 ${
                          milestone.is_completed ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          top: "16px",
                          height: `${32 * (milestones.length - index - 1)}px`,
                        }}
                      ></div>
                    )}
                  </div>
                  <button
  className="text-white font-bold text-sm hover:underline ml-2"
  onClick={() => handleMilestoneClick(milestone)}
>
  {milestone.milestone_name}{" "}
  {milestone.is_completed ? (
    <span className="text-green-500">
      ({new Date(milestone.completed_date).toLocaleDateString()})
    </span>
  ) : (
    <span className="text-red-500">
      ({new Date(milestone.expected_date).toLocaleDateString()})
    </span>
  )}
</button>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

  
        {selectedMilestone && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-bold mb-4">Update Milestone</h2>
              <Form method="post">
              <input
                type="hidden"
                name="milestoneNumber"
                value={selectedMilestone.milestone_number}
              />
<div className="mb-4">
  <label className="block mb-2">Completion Status:</label>
  <Switch
    name="isCompleted"
    defaultChecked={selectedMilestone.is_completed}
    className="mt-2"
    onCheckedChange={(checked) => {
      const isCompletedInput = document.querySelector('input[name="isCompleted"]');
      if (isCompletedInput) {
        isCompletedInput.value = checked ? 'true' : 'false';
      }
    }}
  />
  <input type="hidden" name="isCompleted" value={selectedMilestone.is_completed ? 'true' : 'false'} />
</div>

              <div className="mb-4">
                <label className="block mb-2">Completed Date:</label>
                <input
                  type="date"
                  name="completedDate"
                  defaultValue={
                    selectedMilestone.completed_date
                      ? new Date(selectedMilestone.completed_date).toLocaleDateString('en-CA')
                      : new Date().toLocaleDateString('en-CA')
                  }
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <button
                type="submit"
                disabled={transition.state === 'submitting'}
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  transition.state === 'submitting'
                    ? 'bg-violet-400'
                    : 'bg-violet-500 hover:bg-violet-600'
                }`}
              >
                {transition.state === 'submitting' ? 'Updating Milestone...' : 'Save'}
              </button>
            </Form>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  
  