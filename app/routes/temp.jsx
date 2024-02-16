import { useLoaderData } from '@remix-run/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loader() {
    const allEntries = await prisma.randomtable.findMany();
    const allEntriesWithStrings = allEntries.map(entry => {
        if (entry.id) {
            return {...entry, id: entry.id.toString()};
        }
        return entry;
    });
    return { entries: allEntriesWithStrings };
}

export default function Notes() {
    const { entries } = useLoaderData();

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Notes</h1>
            <ul>
                {entries.map((entry) => (
                    <li key={entry.id} className="mb-2">
                        {entry.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}
