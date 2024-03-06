import { Link, useLoaderData } from '@remix-run/react';
import { UserButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
 
export const loader = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  // Fetch project IDs and names from the database
  const { rows } = await db.query('SELECT id, project_name FROM projects');
  const projects = rows.map(row => ({ id: row.id, name: row.project_name }));

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
              <p id={`cta-${index}`} key={project.id}>
                <Link to={`/projects/${project.name}-${project.id}`} className="text-white bg-transparent border border-white rounded px-4 py-2 hover:bg-white hover:text-violet-500 mt-4">
                  {project.name}
                </Link>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-white">No projects found.</p>
        )}
      </div>
    </main>
  );
};
