import { useLoaderData, useActionData, Form, Link, useNavigation, json } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../components/ui/table";

export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
    return redirect("/");
  }

  const projectid = args.params.id;

  try {
    const { rows: milestones } = await db.query(
      `
      SELECT milestone_number, milestone_name
      FROM public.milestones
      WHERE project_code = $1
      ORDER BY milestone_number ASC
      `,
      [projectid]
    );

    return { projectid, milestones };
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return { projectid, milestones: [] };
  }
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const milestoneNumber = parseInt(formData.get("milestoneNumber"), 10);
  const milestoneName = formData.get("milestoneName");
  const completionDate = formData.get("completionDate");
  const cost = parseFloat(formData.get("cost"));
  const revenue = parseFloat(formData.get("revenue"));
  const docsRequired = formData.get("docsRequired") === "on"; 
  const projectid = params.id;

  try {
    await db.query('BEGIN');

    // Check if the milestone number already exists for the project
    const { rows: existingMilestone } = await db.query(
      `
      SELECT * FROM public.milestones
      WHERE project_code = $1 AND milestone_number = $2
      `,
      [projectid, milestoneNumber]
    );

    if (existingMilestone.length > 0) {
      // Increment milestone numbers equal to and greater than the entered milestone number by 1
      await db.query(
        `
        UPDATE public.milestones
        SET milestone_number = milestone_number + 1
        WHERE project_code = $1 AND milestone_number >= $2
        `,
        [projectid, milestoneNumber]
      );
    }

    // Insert the new milestone with the docsRequired value
    const { rows } = await db.query(
      `
      INSERT INTO public.milestones (milestone_number, milestone_name, expected_date, cost, revenue, is_completed, project_code, emp_code, pm_code, docs_req)
      VALUES ($1, $2, $3, $4, $5, false, $6, (SELECT pm_code FROM public.projects WHERE id = $6), (SELECT pm_code FROM public.projects WHERE id = $6), $7)
      RETURNING *;
      `,
      [milestoneNumber, milestoneName, completionDate, cost, revenue, projectid, docsRequired]
    );

    await db.query('COMMIT');

    return json({ message: "Milestone added successfully" });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error adding milestone:", error);
    return json({ error: "An error occurred while adding the milestone" }, { status: 500 });
  }
};

const Milestone = () => {
  const actionData = useActionData();
  const transition = useNavigation();
  const { projectid, milestones } = useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-500 to-violet-800 flex items-center justify-center">
      <div className="self-start absolute top-0 left-0 p-4">
        <Link to="/" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
          ← Back
        </Link>
      </div>
      <div className="flex space-x-8 w-full max-w-5xl">
        <Form method="post" className="bg-white p-8 rounded-lg shadow-md w-1/2 h-[600px] overflow-auto">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Add Milestone</h2>
          <div className="mb-4">
            <label htmlFor="milestoneNumber" className="block mb-2 font-bold text-gray-700">
              Milestone Number
            </label>
            <input
              type="number"
              id="milestoneNumber"
              name="milestoneNumber"
              defaultValue={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="milestoneName" className="block mb-2 font-bold text-gray-700">
              Milestone Name
            </label>
            <input
              type="text"
              id="milestoneName"
              name="milestoneName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="completionDate" className="block mb-2 font-bold text-gray-700">
              Completion Date
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cost" className="block mb-2 font-bold text-gray-700">
              Cost(INR)
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="revenue" className="block mb-2 font-bold text-gray-700">
              Revenue(INR)
            </label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="mb-4">
  <label htmlFor="docsRequired" className="block mb-2 font-bold text-gray-700">
    Document Required
  </label>
  <Switch id="docsRequired" name="docsRequired" />
</div>
          <div>
            <button
              type="submit"
              disabled={transition.state === 'submitting'}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                transition.state === 'submitting'
                  ? 'bg-violet-400'
                  : 'bg-violet-500 hover:bg-violet-600'
              }`}
            >
              {transition.state === 'submitting' ? 'Adding Milestone...' : 'ADD'}
            </button>
          </div>
          {actionData?.error && (
            <div className="mt-4 text-red-500">{actionData.error}</div>
          )}
          {actionData?.message && (
            <div className="mt-4 text-green-500">{actionData.message}</div>
          )}
        </Form>
        <div className="bg-white p-8 rounded-lg shadow-md w-1/2 h-[600px] overflow-auto">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Milestones</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Milestone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.milestone_number}>
                  <TableCell>{milestone.milestone_number}</TableCell>
                  <TableCell>{milestone.milestone_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Milestone;