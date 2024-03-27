import { Form, useNavigation, useActionData } from "@remix-run/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useEffect, useRef } from "react";

export default function ProjectForm({ userId, templates }) {
  const transition = useNavigation();
  const formRef = useRef(null);

  useEffect(() => {
    if (transition.state === "submitting") {
      formRef.current.reset();
    }
  }, [transition.state]);

  return (
    <Popover>
      <PopoverTrigger>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md">
          Add new project
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80 h-80">
        <Form
          method="post"
          className="flex flex-col h-full bg-white rounded-lg shadow-lg"
          ref={formRef}
        >
          <input type="hidden" name="userId" value={userId} />
          <div className="flex-grow p-6 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Name
                <input
                  type="text"
                  name="projectName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Description
                <textarea
                  name="projectDescription"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </label>
            </div>
            {/* Dropdown for template type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Template Type
                <select
                  name="templateType"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {/* Dropdown for type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Type
                <select
                  name="type"
                  required
                  defaultValue="Wind"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Wind">Wind</option>
                  <option value="Solar">Solar</option>
                </select>
              </label>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-lg">
            <button
              type="submit"
              disabled={transition.state === "submitting"}
              className={`inline-flex justify-center py-1.5 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                transition.state === "submitting"
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {transition.state === "submitting"
                ? "Creating project..."
                : "Create Project"}
            </button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}