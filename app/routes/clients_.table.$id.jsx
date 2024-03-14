import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { CheckCircleIcon, XCircleIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { useLoaderData,Link } from "@remix-run/react";

export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
      return redirect("/");
    console.log(sessionClaims?.metadata.role);
    
  }
  const userId = args.params.id;


  const data = await db.query(`
    SELECT
      d.doc_name AS document_name,
      d.id AS document_id,
      CASE
        WHEN f.id IS NOT NULL AND f.status_code IS TRUE THEN 'Uploaded'
        WHEN f.id IS NOT NULL AND f.status_code IS FALSE THEN 'Rejected'
        WHEN f.id IS NOT NULL AND f.status_code IS NULL THEN 'Pending'
        ELSE 'Not Uploaded'
      END AS status_code,
      p.project_name,
      p.id AS project_code
    FROM
      documents d
    JOIN
      projects p ON p.client_code = $1
    LEFT JOIN
      files f ON d.id = f.document_code AND p.id = f.project_code AND f.client_code = p.client_code
    WHERE
      f.is_latest IS TRUE OR f.is_latest IS NULL;
  `, [userId]);

  return { userId, data: data.rows };
};

export default function DocumentStatus() {
  const { userId, data } = useLoaderData();

  const projectNames = [...new Set(data.map((row) => row.project_name))];

  const documentStatuses = data.reduce((map, row) => {
    if (!map[row.document_name]) {
      map[row.document_name] = {};
    }
    map[row.document_name][row.project_name] = row.status_code;
    return map;
  }, {});

  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow max-w-7xl mx-auto">
        <div className="self-start absolute top-0 left-0 p-4">
          <Link to={`/clients/${userId}`} className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Document Status</h1>
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[300px]">Document Name</TableHead>
                {projectNames.map((projectName) => (
                  <TableHead key={projectName} className="sticky top-0 bg-white">
                    {projectName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(documentStatuses).map(([documentName, statuses]) => (
                <TableRow key={documentName}>
                  <TableCell className="sticky left-0 bg-white z-10 min-w-[300px]">{documentName}</TableCell>
                  {projectNames.map((projectName) => {
                    const status = statuses[projectName];
                    let icon = null;
                    if (status === 'Uploaded') {
                      icon = <CheckCircleIcon className="h-5 w-5 text-green-500" />;
                    } else if (status === 'Rejected') {
                      icon = <XCircleIcon className="h-5 w-5 text-red-500" />;
                    } else if (status === 'Pending') {
                      icon = <ClockIcon className="h-5 w-5 text-yellow-500" />;
                    } else {
                      icon = <NoSymbolIcon className="h-5 w-5 text-gray-500" />;
                    }
                    return <TableCell key={projectName}>{icon}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}