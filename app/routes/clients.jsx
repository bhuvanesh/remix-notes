import db from '../utils/cdb.server';
import { useLoaderData,Link } from '@remix-run/react';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
  } from '../components/ui/table'

export const loader = async () => {
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
        <div className="bg-gradient-to-r from-violet-500 to-violet-800 h-screen flex justify-center items-center">
            <div className="max-w-lg w-full"> {/* Adjust the max-width as needed */}
                <Table className="bg-white rounded-lg">
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <h1 className="text-black-500 text-4xl neon-effect">Client's List</h1>
                            </TableCell>
                        </TableRow>
                        {clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell>
                                    <Link to={`/clients/${client.id}`} className="text-blue-500 hover:underline">
                                        {client.client_name}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}