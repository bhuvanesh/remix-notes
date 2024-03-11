import { Form, useNavigation, useActionData } from "@remix-run/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useEffect, useRef } from "react";

export default function ProjectForm({ userId }) {
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
      <PopoverContent>
        <Form
          method="post"
          className="space-y-4 max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg"
          ref={formRef}
        >
          <input type="hidden" name="userId" value={userId} />
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Description
              <textarea
                name="projectDescription"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </label>
          </div>
          <button
            type="submit"
            disabled={transition.state === "submitting"}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              transition.state === "submitting"
                ? "bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {transition.state === "submitting"
              ? "Creating project..."
              : "Create Project"}
          </button>
        </Form>
      </PopoverContent>
    </Popover>
  );
}