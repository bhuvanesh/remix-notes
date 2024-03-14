import db from '../utils/cdb.server';
import { useLoaderData,Link } from '@remix-run/react';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
    TableHead
  } from '../components/ui/table';
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import { UserButton } from "@clerk/remix";



  export const loader = async (args) => {
    const { sessionClaims } = await getAuth(args);
  
    // If the user does not have the admin role, redirect them to the home page
    if (sessionClaims?.metadata.role !== "admin") {
        return redirect("/");
      console.log(sessionClaims?.metadata.role);
      
    }

    try {
        const result = await db.query('SELECT id, client_name FROM public.clients');
        return result.rows;
    } catch (error) {
        console.error('Error retrieving data from the database:', error);
        return [];
    }
}

export default function Clients() {
    const clients = useLoaderData();
    return (
        <div className="bg-gradient-to-r from-violet-500 to-violet-800 h-screen flex flex-col justify-center items-center">
            <UserButton afterSignOutUrl="/clients" />
            <div className="max-w-lg w-full mt-8"> {/* Adjust the max-width as needed */}
                <Table className="bg-white rounded-lg">
                <TableHeader>
                <TableRow>
                            {/* <TableCell colSpan={2}>
                                <h1 className="text-black-500 text-4xl neon-effect">Clients List</h1>
                            </TableCell> */}
                            <TableHead className='text-center font-bold'> Clients List</TableHead>
                        </TableRow>
                </TableHeader>
                    <TableBody>
                        {clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell colSpan={2}>
                                    <Link to={`/clients/${client.id}`} className="text-blue-500 hover:underline px-3">
                                        {client.client_name}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}