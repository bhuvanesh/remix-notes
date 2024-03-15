import { createClerkClient } from "@clerk/remix/api.server";
import { useLoaderData, Link, Form, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import db from "./../utils/cdb.server";
import { useEffect, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";



export default function Users() {
  const transition = useNavigation();
  const formRef = useRef(null);

  useEffect(() => {
    if (transition.state === "submitting") {
      formRef.current.reset();
    }
  }, [transition.state]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Client
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 h-96 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Create Client</h2>
            <Form method="post" ref={formRef} className="bg-white rounded">
              <div className="mb-3">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-1">
                  Username(client name):
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  disabled={transition.state === "submitting"}
                  className={`inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    transition.state === "submitting"
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {transition.state === "submitting"
                    ? "Creating..."
                    : "Create client"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
  
}
