import { useLoaderData, useActionData, Form, Link, useNavigation, json } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server"; //postgre connection
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

  // Fetch project data from the database
  const project = await db.query(
    "SELECT p.*, t.template_name FROM public.projects p LEFT JOIN public.templates t ON p.template_type = t.id WHERE p.id = $1",
    [projectid]
  );

  // Fetch all template names and ids from the templates table
  const templates = await db.query("SELECT id, template_name FROM public.templates");

  return json({ project: project.rows[0], templates: templates.rows });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const projectid = params.id;
  const action = formData.get("action");

  if (action === "delete") {
    // Update the is_deleted field to true for the project
    await db.query("UPDATE public.projects SET is_deleted = true WHERE id = $1", [projectid]);
    return redirect("/");
  } else {
    const template_type = formData.get("template_type");
    const project_name = formData.get("project_name");
    const type = formData.get("type");
    const project_type = formData.get("project_type");
    const description = formData.get("description");

    // Update project data in the database
    await db.query(
      "UPDATE public.projects SET template_type = $1, project_name = $2, type = $3, project_type = $4, description = $5 WHERE id = $6",
      [template_type, project_name, type, project_type, description, projectid]
    );

    return redirect(`/clients`);
  }
};

export default function EditProject() {
  const { project, templates } = useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
      <Form method="post" encType="multipart/form-data" className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
        <div className="mb-4">
          <label htmlFor="template_type" className="block mb-2">
            Template Name
          </label>
          <select
            id="template_type"
            name="template_type"
            defaultValue={project.template_type || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select Template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.template_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="project_name" className="block mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="project_name"
            name="project_name"
            defaultValue={project.project_name || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="type" className="block mb-2">
            Type
          </label>
          <input
            type="text"
            id="type"
            name="type"
            defaultValue={project.type || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="project_type" className="block mb-2">
            Project Type
          </label>
          <select
            id="project_type"
            name="project_type"
            defaultValue={project.project_type || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select Project Type</option>
            <option value="VCS">VCS</option>
            <option value="GCC">GCC</option>
            <option value="IREC">IREC</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={project.description || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            name="action"
            value="default"
            className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Save Changes
          </button>
          <button
            type="submit"
            name="action"
            value="delete"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete Project
          </button>
        </div>
      </Form>
    </div>
  );
}