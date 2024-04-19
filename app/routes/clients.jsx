import db from '../utils/cdb.server';
import { useLoaderData, Link, useActionData, Form } from '@remix-run/react';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
    TableHead
} from '../components/ui/table';
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect, json } from "@remix-run/node";
import { UserButton } from "@clerk/remix";
import { createClerkClient } from "@clerk/remix/api.server";
import Users from '../components/NewClient';
import { useEffect } from "react";
import { toast } from "sonner";

export const loader = async (args) => {
    const { sessionClaims } = await getAuth(args);

    if (sessionClaims?.metadata.role !== "admin") {
        return redirect("/");
        console.log(sessionClaims?.metadata.role);
    }

    try {
        const result = await db.query('SELECT id, client_name FROM public.clients WHERE is_deleted = false');
        return result.rows;
    } catch (error) {
        console.error('Error retrieving data from the database:', error);
        return [];
    }
}

export default function Clients() {
    const clients = useLoaderData();
    const actionData = useActionData();

    useEffect(() => {
        if (actionData?.success) {
            toast.success(actionData.success);
        } else if (actionData?.error) {
            toast.error(actionData.error);
        }
    }, [actionData]);

    return (
        <div className="bg-gradient-to-r from-violet-500 to-violet-800 h-screen flex flex-col justify-center items-center">
            <div className="self-start absolute top-0 left-0 p-4 flex space-x-4">
                <Link to="/template" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
                    Create Template
                </Link>
                <Link to="/clients/summary" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
                    Summary
                </Link>
            </div>
            <div className="flex justify-center mb-4">
                <UserButton afterSignOutUrl="/clients" />
            </div>
            <Users />
            <div className="max-w-lg w-full mt-8">
                <div className="bg-white rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center font-bold">Clients List</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '400px' }}>
                        <Table>
                            <TableBody>
                                {clients.map(client => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <Link to={`/clients/${client.id}`} className="text-blue-500 hover:underline px-3">
                                                {client.client_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Form method="post">
                                                <input type="hidden" name="id" value={client.id} />
                                                <button type="submit" name="action" value="Delete" className="text-red-500 hover:text-red-700">
                                                    X
                                                </button>
                                            </Form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const action = async ({ request }) => {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "Delete") {
        const id = formData.get("id");

        if (typeof id !== "string") {
            return json({ error: "Invalid client ID" }, { status: 400 });
        }

        try {
            await db.query(
                `UPDATE ${process.env.CLIENTS_TABLE} SET is_deleted = true WHERE id = $1`,
                [id]
            );

            return json({ success: "Client deleted" }, { status: 200 });
        } catch (error) {
            console.error("Error deleting client:", error);
            return json({ error: "Failed to delete client" }, { status: 500 });
        }
    } else {
        const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const email = formData.get("email");
        const username = formData.get("username");
        const password = formData.get("password");

        if (
            typeof email !== "string" ||
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return json({ error: "Invalid form data" }, { status: 400 });
        }

        try {
            const user = await client.users.createUser({
                emailAddress: [email],
                username: username,
                password: password,
            });

            console.log("Created user ID:", user.id);
            console.log("Created user:", user.username);

            await db.query(
                `INSERT INTO ${process.env.CLIENTS_TABLE} (id, client_name, created_at) VALUES ($1, $2, NOW())`,
                [user.id, user.username]
            );

            return json({ success: "Client created" }, { status: 201 });
        } catch (error) {
            console.error("Error creating user:", error);

            if (error.errors && error.errors.length > 0) {
                const errorMessage = error.errors[0].message;
                return json({ error: errorMessage }, { status: 400 });
            }

            return json({ error: "Failed to create user" }, { status: 500 });
        }
    }
};
