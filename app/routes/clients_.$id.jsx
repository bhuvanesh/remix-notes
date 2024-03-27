import { Link, useLoaderData,useActionData,json } from '@remix-run/react';
import { UserButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { Progress } from "./../components/ui/progress";
import ProjectForm from '../components/NewProject';
import { useEffect } from 'react';
import { toast } from "sonner";



export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
    return redirect("/");
  }

  const userId = args.params.id;

  // Fetch project IDs, names, and percentage of latest documents from the database
  const query = `
  WITH project_counts AS (
    SELECT 
      p.id AS project_code,
      p.project_name,
      COUNT(CASE WHEN f.is_latest = true AND f.status_code = true THEN f.project_code END) AS latest_doc_count 
    FROM 
      ${process.env.PROJECTS_TABLE} p
      LEFT JOIN ${process.env.FILES_TABLE} f ON p.id = f.project_code 
    WHERE 
      p.client_code = $1
    GROUP BY 
      p.id, p.project_name
  ), total_docs AS (
    SELECT 
      p.id AS project_code,
      COUNT(DISTINCT dl.id) AS total_doc_count
    FROM 
      ${process.env.PROJECTS_TABLE} p
      JOIN ${process.env.DOC_LIST_TABLE} dl ON p.template_type = dl.template_type
    WHERE 
      p.client_code = $1
    GROUP BY 
      p.id
  )
  SELECT 
    pc.project_code AS id,
    pc.project_name AS name,
    ROUND((pc.latest_doc_count * 100.0) / COALESCE(td.total_doc_count, 0), 2) AS percentage
  FROM 
    project_counts pc
    LEFT JOIN total_docs td ON pc.project_code = td.project_code;
  `;
  const { rows } = await db.query(query, [userId]);
  const projects = rows.map(row => ({
    id: row.id,
    name: row.name,
    percentage: row.percentage
  }));

  // Fetch template data from the database
  const templatesResult = await db.query(`SELECT id, template_name FROM ${process.env.TEMPLATES_TABLE}`);
  const templates = templatesResult.rows;

  // Pass project data and template data to the component
  return { projects, userId, templates };
};

export default function Index() {
  const { projects, userId, templates } = useLoaderData();
  

  const actionData = useActionData();
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
      } else if (actionData.success) {
        toast.success(actionData.success); 
      }
    }
  }, [actionData]);





  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center min-h-screen relative">
      <div className="self-start absolute top-0 left-0 p-4">
        <Link to={`/clients`} className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
          ← Back
        </Link>
        <Link to={`/clients/table/${userId}`} className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
          Upload Summary
        </Link>
      </div>
      <div className="grid place-items-center">
        <UserButton afterSignOutUrl="/" />
        <h1 className="text-white text-sm md:text-lg lg:text-xl">A better way of keeping track of your notes</h1>
        <p className="text-white text-xs md:text-sm lg:text-base mb-4">Try our early beta and never lose track of your notes again!</p>
        <ProjectForm userId={userId} templates={templates} />
        {projects.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {projects.map((project, index) => (
              <div key={project.id} className="w-full max-w-sm">
                <Link
                  to={`/clients/projects/${project.name.replace(/-/g, '')}-${project.id}-${userId}`}
                  className="text-white bg-transparent border border-white rounded px-4 py-2 mt-4 block text-center cursor-pointer hover:bg-white hover:text-violet-500 h-full"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold">{project.name.replace(/-/g, '')}</div>
                    <div className="p-2">{project.percentage}%</div>
                  </div>
                  <Progress value={project.percentage} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">No projects found.</p>
        )}
      </div>
    </main>
  );
  
}

export async function action({ request }) {
  const formData = await request.formData();
  const projectName = formData.get("projectName");
  const projectDescription = formData.get("projectDescription");
  const clientCode = formData.get("userId");
  const templateType = formData.get("templateType");
  const type = formData.get("type");

  try {
    // Fetch the highest current id in the projects table
    const maxIdResult = await db.query('SELECT MAX(id) FROM public.projects');
    let nextId = parseInt(maxIdResult.rows[0].max, 10);

    // If there are no projects yet or the maxId is not a valid number, start with id 1
    if (isNaN(nextId)) {
      nextId = 0;
    }

    // Increment the nextId by 1
    nextId += 1;

    // Insert the new project with the incremented id, template type, and type
    const insertResult = await db.query(
      `INSERT INTO public.projects (id, project_name, client_code, description, created_at, template_type, type)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6)
       RETURNING id;`,
      [nextId, projectName, clientCode, projectDescription, templateType, type]
    );

    console.log('Inserted project with ID:', insertResult.rows[0].id);

    // Return some data to indicate success
    return json({ success: "Project added successfully." });
  } catch (error) {
    console.error('Error inserting project:', error);
    return json({ error: error.message });
  }
}