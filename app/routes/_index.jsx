import { Link, useLoaderData } from '@remix-run/react';
import { UserButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { Progress } from "./../components/ui/progress";

export const loader = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  // Fetch project IDs, names, and percentage of latest documents from the database
  const query = `
    WITH project_latest_counts AS (
      SELECT 
        f.project_code,
        p.project_name,
        COUNT(*) AS latest_doc_count,
        (SELECT COUNT(DISTINCT id) FROM documents) AS total_doc_count
      FROM files f
      JOIN projects p ON f.project_code = p.id
      WHERE f.is_latest = true
        AND p.client_code = $1
      GROUP BY f.project_code, p.project_name
    )
    SELECT 
      project_code AS id,
      project_name AS name,
      ROUND((latest_doc_count * 100.0) / total_doc_count, 2) AS percentage 
    FROM project_latest_counts;
  `;
  const { rows } = await db.query(query, [userId]);
  const projects = rows.map(row => ({
    id: row.id,
    name: row.name,
    percentage: row.percentage
  }));

  // Pass project data to the component
  return { projects };
};

export default function Index() {
  const { projects } = useLoaderData();

  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center h-screen">
      <div className="grid place-items-center">
        <UserButton afterSignOutUrl="/" />
        <h1 className="text-white text-sm md:text-lg lg:text-xl">A better way of keeping track of your notes</h1>
        <p className="text-white text-xs md:text-sm lg:text-base mb-4">Try our early beta and never lose track of your notes again!</p>
        {projects.length > 0 ? (
          <div className="flex flex-col gap-4">
            {projects.map((project, index) => (
              <div key={project.id} className="w-full">
                <Link
                  to={`/projects/${project.name}-${project.id}`}
                  className="text-white bg-transparent border border-white rounded px-4 py-2 mt-4 block text-center cursor-pointer hover:bg-white hover:text-violet-500"
                >
                  <div className="font-bold">{project.name}</div>
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