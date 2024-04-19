import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { CheckCircleIcon, XCircleIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";

export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
    return redirect("/");
    console.log(sessionClaims?.metadata.role);
  }

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
      p.id AS project_code,
      p.project_type
    FROM
    ${process.env.DOC_LIST_TABLE} d
    JOIN
    ${process.env.TEMPLATES_TABLE} t ON d.template_type = t.id
    JOIN
      ${process.env.PROJECTS_TABLE} p ON p.template_type = t.id
    LEFT JOIN
      ${process.env.FILES_TABLE} f ON d.id = f.document_code AND p.id = f.project_code AND f.client_code = p.client_code
    WHERE
      (f.is_latest IS TRUE OR f.is_latest IS NULL) AND p.is_deleted IS FALSE;
  `);

  const milestoneData = await db.query(`
    SELECT
      p.project_name,
      p.id AS project_code,
      p.project_type,
      m.milestone_name,
      m.expected_date,
      m.is_completed,
      e.name AS assignee_name
    FROM
      projects p
    LEFT JOIN
      milestones m ON p.id = m.project_code
    LEFT JOIN
      employees e ON m.emp_code = e.id
    WHERE
      p.is_deleted IS FALSE
    ORDER BY
      p.id, m.expected_date;
  `);

  const projectTypes = [...new Set(data.rows.map((row) => row.project_type))];

  return { data: data.rows, milestoneData: milestoneData.rows, projectTypes };
};

export default function DocumentStatusPage() {
  const { data, milestoneData, projectTypes } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectType = searchParams.get("projectType") || "all";

  const filteredData = selectedProjectType === "all"
    ? data
    : data.filter((row) => row.project_type === selectedProjectType);

  const filteredMilestoneData = selectedProjectType === "all"
    ? milestoneData
    : milestoneData.filter((row) => row.project_type === selectedProjectType);

  const projectNames = [...new Set(filteredData.map((row) => row.project_name))];

  const documentStatuses = filteredData.reduce((map, row) => {
    if (!map[row.document_name]) {
      map[row.document_name] = {};
    }
    map[row.document_name][row.project_name] = row.status_code;
    return map;
  }, {});

  const projectMilestones = filteredMilestoneData.reduce((map, milestone) => {
    if (!map[milestone.project_code]) {
      map[milestone.project_code] = {
        projectName: milestone.project_name,
        milestones: [],
      };
    }
    if (milestone.milestone_name) {
      map[milestone.project_code].milestones.push(milestone);
    }
    return map;
  }, {});

  const currentDate = new Date();

  const handleProjectTypeChange = (event) => {
    setSearchParams({ projectType: event.target.value });
  };

  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow max-w-7xl mx-auto">
        <div className="self-start absolute top-0 left-0 p-4">
          <Link to="/clients" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
            ← Back
          </Link>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Project Overview</h1>
          <select
            value={selectedProjectType}
            onChange={handleProjectTypeChange}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            <option value="all">All</option>
            {projectTypes.map((projectType) => (
              <option key={projectType} value={projectType}>
                {projectType}
              </option>
            ))}
          </select>
        </div>
        <Tabs defaultValue="document-status">
          <TabsList>
            <TabsTrigger value="document-status">Document Status</TabsTrigger>
            <TabsTrigger value="milestone-summary">Milestone Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="document-status">
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
          </TabsContent>
          <TabsContent value="milestone-summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {projectNames.map((projectName) => {
              const project = projectMilestones[filteredData.find((row) => row.project_name === projectName)?.project_code];
              const hasNoMilestones = project?.milestones.length === 0;

              return (
                <div
                  key={projectName}
                  className={`bg-white rounded shadow p-4 h-80 overflow-y-auto ${hasNoMilestones ? 'cursor-default' : 'hover:bg-gray-100'}`}
                >
                  <h2 className="text-xl font-bold mb-2">{projectName}</h2>
                  {project?.milestones.length > 0 ? (
                    <Link
                      to={`/clients/milestone/${project?.milestones[0]?.project_code}`}
                      className="block"
                    >
                      <div className="mb-4">
                        <p>
                          {project.milestones.filter((m) => m.is_completed).length}/{project.milestones.length} milestones completed
                        </p>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">Upcoming Milestones:</h3>
                        {project.milestones
                          .filter((m) => !m.is_completed && new Date(m.expected_date) > currentDate)
                          .map((milestone) => (
                            <p key={milestone.milestone_name}>
                              {milestone.milestone_name} ({new Date(milestone.expected_date).toLocaleDateString()})
                            </p>
                          ))}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Overdue Milestones:</h3>
                        {project.milestones
                          .filter((m) => !m.is_completed && new Date(m.expected_date) < currentDate)
                          .map((milestone) => {
                            const overdueDays = Math.floor((currentDate - new Date(milestone.expected_date)) / (1000 * 60 * 60 * 24));
                            return (
                              <p key={milestone.milestone_name}>
                                {milestone.milestone_name} - overdue by {overdueDays} days ({milestone.assignee_name}) - Due: {new Date(milestone.expected_date).toLocaleDateString()}
                              </p>
                            );
                          })}
                      </div>
                    </Link>
                  ) : (
                    <p>No milestones yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </main>
  );
  
}
