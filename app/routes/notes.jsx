import { useActionData, Form,useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import NoteList from "../components/NoteList";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";



const prisma = new PrismaClient();

export const loader = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  const allEntries = await prisma.notes.findMany({
    where: { userid: userId },
  });
  const notesFormatted = allEntries.map(entry => {
    const noteObject = JSON.parse(entry.note);
    return {
      id: entry.id.toString(),
      title: noteObject.title,
      content: noteObject.noteContent,
    };
  });
  return { entries: notesFormatted, userId };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const noteContent = formData.get("note");
  const userId = formData.get("userId");

  try {
    const noteData = JSON.stringify({ title, noteContent });
    const addedNote = await prisma.notes.create({
      data: {
        note: noteData,
        userid: userId,
      },
    });
    const addedNoteSanitized = {
      ...addedNote,
      id: addedNote.id.toString(),
    };
    return json({ success: true, addedNote: addedNoteSanitized });
  } catch (error) {
    console.error("Failed to add note:", error);
    return json({ success: false, error: "Failed to add note" });
  }
};

export default function Notes() {
  const data = useActionData();
  const { entries: notes, userId } = useLoaderData();

  return (
    <div className="bg-gradient-to-r from-violet-500 to-violet-700 min-h-screen flex flex-col items-center justify-center space-y-6 py-12">
      <Form method="post" className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <input
          type="hidden"
          name="userId"
          value={userId}
        />
        <input
          type="text"
          name="title"
          className="w-full mb-4 p-2 rounded border border-gray-300 text-sm"
          placeholder="Title"
        />
        <textarea
          name="note"
          className="w-full mb-4 p-2 rounded border border-gray-300 text-sm"
          placeholder="Note"
        ></textarea>
        <button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full">
          Add Note
        </button>
      </Form>
      {data?.success && <p className="text-white text-xl text-center w-full">{data.addedNote.title} added!</p>}
      <div className="w-full px-4 flex justify-center">
        <NoteList notes={notes} />
      </div>
    </div>
  );
}