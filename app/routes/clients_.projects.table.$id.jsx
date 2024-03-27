import { redirect, useLoaderData, Link } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "./../utils/cdb.server";
import { CheckCircleIcon, XCircleIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";

export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
    return redirect("/");
    console.log(sessionClaims?.metadata.role);
  }

  const [clientId, projectId] = args.params.id.split('-');

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
    ${process.env.DOC_LIST_TABLE} d
    JOIN
    ${process.env.TEMPLATES_TABLE} t ON d.template_type = t.id
    JOIN
      ${process.env.PROJECTS_TABLE} p ON p.template_type = t.id AND p.client_code = $1
    LEFT JOIN
      ${process.env.FILES_TABLE} f ON d.id = f.document_code AND p.id = f.project_code AND f.client_code = p.client_code
    WHERE
      (f.is_latest IS TRUE OR f.is_latest IS NULL)
      AND p.id = $2;
  `, [clientId, projectId]);

  return { data: data.rows, clientId };
};

export default function DocumentStatus() {
  const {data,clientId} = useLoaderData();
  const projectName = data[0]?.project_name;
  const projectCode = data[0]?.project_code;

  const projectLink = `/clients/projects/${projectName.replace(/-/g, '')}-${projectCode}-${clientId}`;

  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow max-w-7xl mx-auto">
        <div className="self-start absolute top-0 left-0 p-4">
          <Link  to={projectLink} className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Document Status</h1>
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[300px]">Document Name</TableHead>
                <TableHead className="sticky top-0 bg-white">{projectName}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.document_id}>
                  <TableCell className="sticky left-0 bg-white z-10 min-w-[300px]">{row.document_name}</TableCell>
                  <TableCell>
                    {row.status_code === 'Uploaded' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {row.status_code === 'Rejected' && <XCircleIcon className="h-5 w-5 text-red-500" />}
                    {row.status_code === 'Pending' && <ClockIcon className="h-5 w-5 text-yellow-500" />}
                    {row.status_code === 'Not Uploaded' && <NoSymbolIcon className="h-5 w-5 text-gray-500" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
